import asyncio
import httpx

async def test_backend():
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://localhost:8000/api/destinations", timeout=5.0)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_backend())
