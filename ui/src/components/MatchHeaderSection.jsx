import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import { User } from "lucide-react";

const Header = () => {
    return (
        <nav className="nav_bar backdrop-blur supports-[backdrop-filter]:bg-nus_blue">
            <div className="flex justify-between px-5">
                <div className="flex items-center flex-shrink-0 group">
                    <img className="logo transition-transform duration-200 group-hover:scale-105" src={logo} alt="logo" />
                    <span className="text-xl tracking-tight text-white font-bold">PeerPrep</span>
                </div>
                <div className="flex items-center">
                    <Link to="/profile">
                        <button className="p-2 rounded-full bg-white hover:bg-nus_orange transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
                            <User className="h-6 w-6 text-black" />
                        </button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
export default Header; 
