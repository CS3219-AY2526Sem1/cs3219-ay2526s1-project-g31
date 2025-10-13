import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { navItems } from "../constants";

const Navbar = () => {
    return (
        <nav className="nav_bar">
            <div className="container px-4 mx-auto relative text-sm">
                <div className="flex justify-between items-center">
                    <div className="flex items-center flex-shrink-0">
                        <img className="logo" src={logo} alt="logo" />
                        <span className="text-xl tracking-tight text-white font-bold">PeerPrep</span>
                    </div>
                    <ul className="nav_bar_items">
                        {navItems.map((item, index) => (
                            <li key={index}>
                                <a href={item.href}>{item.label}</a>
                            </li>
                        ))}
                    </ul>
                    <div className="cta_div">
                        <Link to="/login" className="sign_in">
                            Sign In
                        </Link>
                        <Link to="/login" className="create_account">
                            Create Account
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
export default Navbar
