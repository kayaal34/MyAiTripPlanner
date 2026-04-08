import argparse
import asyncio
from typing import Iterable

from sqlalchemy import delete, func, select

from database.database import AsyncSessionLocal
from database.models import FavoritePlace, Subscription, Trip, User


def _print_table(headers: list[str], rows: Iterable[list[str]]) -> None:
    rows = list(rows)
    widths = [len(h) for h in headers]
    for row in rows:
        for i, cell in enumerate(row):
            widths[i] = max(widths[i], len(cell))

    def format_row(row: list[str]) -> str:
        return " | ".join(cell.ljust(widths[i]) for i, cell in enumerate(row))

    print(format_row(headers))
    print("-+-".join("-" * w for w in widths))
    for row in rows:
        print(format_row(row))


async def cmd_users_list(args: argparse.Namespace) -> None:
    async with AsyncSessionLocal() as db:
        query = select(User).order_by(User.id.asc())
        if args.limit:
            query = query.limit(args.limit)

        result = await db.execute(query)
        users = result.scalars().all()

    rows = [
        [
            str(u.id),
            u.username or "",
            u.email or "",
            "yes" if u.is_active else "no",
            str(u.remaining_routes),
            str(u.created_at),
        ]
        for u in users
    ]

    print(f"total_users={len(rows)}")
    _print_table(
        ["id", "username", "email", "active", "routes", "created_at"],
        rows,
    )


async def cmd_users_find(args: argparse.Namespace) -> None:
    if not args.email and not args.username:
        raise SystemExit("Provide at least one filter: --email or --username")

    async with AsyncSessionLocal() as db:
        query = select(User)
        if args.email:
            query = query.where(User.email.ilike(f"%{args.email}%"))
        if args.username:
            query = query.where(User.username.ilike(f"%{args.username}%"))
        query = query.order_by(User.id.asc())

        result = await db.execute(query)
        users = result.scalars().all()

    rows = [
        [
            str(u.id),
            u.username or "",
            u.email or "",
            "yes" if u.is_active else "no",
            str(u.remaining_routes),
            str(u.created_at),
        ]
        for u in users
    ]

    print(f"matched_users={len(rows)}")
    if rows:
        _print_table(
            ["id", "username", "email", "active", "routes", "created_at"],
            rows,
        )


async def cmd_stats(args: argparse.Namespace) -> None:
    async with AsyncSessionLocal() as db:
        total_users = await db.scalar(select(func.count(User.id)))
        active_users = await db.scalar(select(func.count(User.id)).where(User.is_active.is_(True)))
        total_trips = await db.scalar(select(func.count(Trip.id)))
        saved_trips = await db.scalar(select(func.count(Trip.id)).where(Trip.is_saved.is_(True)))
        total_subs = await db.scalar(select(func.count(Subscription.id)))

    rows = [
        ["users.total", str(total_users or 0)],
        ["users.active", str(active_users or 0)],
        ["trips.total", str(total_trips or 0)],
        ["trips.saved", str(saved_trips or 0)],
        ["subscriptions.total", str(total_subs or 0)],
    ]
    _print_table(["metric", "value"], rows)


async def _delete_user_with_related(db, user: User) -> None:
    await db.execute(delete(Subscription).where(Subscription.user_id == user.id))
    await db.execute(delete(FavoritePlace).where(FavoritePlace.user_id == user.id))
    await db.execute(delete(Trip).where(Trip.user_id == user.id))
    await db.delete(user)


async def cmd_users_delete(args: argparse.Namespace) -> None:
    if args.all and not args.yes:
        raise SystemExit("Bulk delete requires --yes confirmation.")

    async with AsyncSessionLocal() as db:
        if args.all:
            result = await db.execute(select(User).order_by(User.id.asc()))
            users = result.scalars().all()
            if not users:
                print("No users found.")
                return

            for user in users:
                await _delete_user_with_related(db, user)
            await db.commit()
            print(f"deleted_users={len(users)}")
            return

        if args.id is None and not args.email:
            raise SystemExit("Provide one selector: --id or --email, or use --all --yes")

        query = select(User)
        if args.id is not None:
            query = query.where(User.id == args.id)
        else:
            query = query.where(User.email == args.email)

        result = await db.execute(query)
        user = result.scalar_one_or_none()
        if not user:
            print("User not found.")
            return

        await _delete_user_with_related(db, user)
        await db.commit()
        print(f"deleted_user_id={user.id} email={user.email}")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="admin_panel",
        description="AI Tripper terminal admin panel",
    )
    subparsers = parser.add_subparsers(dest="command", required=True)

    users_parser = subparsers.add_parser("users", help="User operations")
    users_sub = users_parser.add_subparsers(dest="users_command", required=True)

    users_list = users_sub.add_parser("list", help="List all users")
    users_list.add_argument("--limit", type=int, default=0, help="Limit number of rows")
    users_list.set_defaults(func=cmd_users_list)

    users_find = users_sub.add_parser("find", help="Find users by email/username")
    users_find.add_argument("--email", type=str, default="", help="Search by email contains")
    users_find.add_argument("--username", type=str, default="", help="Search by username contains")
    users_find.set_defaults(func=cmd_users_find)

    users_delete = users_sub.add_parser("delete", help="Delete a user or all users")
    users_delete.add_argument("--id", type=int, default=None, help="Delete by user id")
    users_delete.add_argument("--email", type=str, default="", help="Delete by exact email")
    users_delete.add_argument("--all", action="store_true", help="Delete all users")
    users_delete.add_argument("--yes", action="store_true", help="Required confirmation for --all")
    users_delete.set_defaults(func=cmd_users_delete)

    stats_parser = subparsers.add_parser("stats", help="Quick database stats")
    stats_parser.set_defaults(func=cmd_stats)

    return parser


def main() -> None:
    parser = build_parser()
    args = parser.parse_args()
    asyncio.run(args.func(args))


if __name__ == "__main__":
    main()
