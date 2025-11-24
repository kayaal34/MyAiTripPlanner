import { IoLogoFacebook, IoLogoTwitter, IoLogoGoogle, IoLogoInstagram } from "react-icons/io5";

export default function SocialTiles() {
    return (
        <ul className="modern-social fixed top-6 right-6 z-[99999] scale-90 flex gap-[20px] pointer-events-auto">

            <li style={{ "--i": "#3b5998", "--j": "#4c70ba" } as React.CSSProperties}>
                <span className="icon">
                    <IoLogoFacebook size={24} />
                </span>
                <span className="title">Facebook</span>
            </li>

            <li style={{ "--i": "#1DA1F2", "--j": "#0d8ddb" } as React.CSSProperties}>
                <span className="icon">
                    <IoLogoTwitter size={24} />
                </span>
                <span className="title">Twitter</span>
            </li>

            <li style={{ "--i": "#db4437", "--j": "#c23321" } as React.CSSProperties}>
                <span className="icon">
                    <IoLogoGoogle size={24} />
                </span>
                <span className="title">Google</span>
            </li>

            <li style={{ "--i": "#e4405f", "--j": "#d81b60" } as React.CSSProperties}>
                <span className="icon">
                    <IoLogoInstagram size={24} />
                </span>
                <span className="title">Instagram</span>
            </li>

        </ul>
    );
}
