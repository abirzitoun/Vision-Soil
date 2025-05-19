import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Bell, Settings, LogOut, User, Home, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  isLoggedIn: boolean;
  userRole: string | null;
}

const getMenuItems = (userRole: string | null) => {
  switch (userRole) {
    case "admin":
      return [
        { title: "Dashboard", url: "/admin" },
        { title: "Farms", url: "/admin/farms" },
        { title: "Users", url: "/admin/users" },
        { title: "Robots", url: "/admin/robots" },
      ];
    default:
      return [];
  }
};

const Header = ({ isLoggedIn, userRole }: HeaderProps) => {
  if (!isLoggedIn) return null; // Hide header if user is not logged in

  const navigate = useNavigate();
  const [user, setUser] = useState<{ first_name: string; last_name: string; role: string } | null>(null);
  const items = getMenuItems(userRole);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      axios
        .get(`http://localhost:8081/api/user/profile/${userId}`)
        .then((response) => setUser(response.data))
        .catch((error) => console.error("❌ Erreur de chargement du profil :", error));
    }
  }, []);

  // 🔹 Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("authToken");
    navigate("/login");
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <img src="/logoVision.png" alt="VisionSoil Logo" className="h-10" />

        {/* Navbar Menu */}
        <nav className="flex space-x-8">
          {items.map((item) => (
            <button
              key={item.url}
              onClick={() => navigate(item.url)}
              className="flex items-center text-gray-700 hover:text-soil-600 transition-colors py-2 px-4 rounded-md"
            >
              <span>{item.title}</span>
            </button>
          ))}
        </nav>

        {/* Notifications, Settings & User Profile */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-700 hover:text-soil-600 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          {/* Settings */}
          <button className="p-2 text-gray-700 hover:text-soil-600 transition-colors">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-soil-600 text-white flex items-center justify-center">
                  <span className="text-sm font-medium">
                    {user ? `${user.first_name.charAt(0)}${user.last_name.charAt(0)}` : "JD"}
                  </span>
                </div>
                <div className="text-sm">
                  <p className="font-medium">{user ? `${user.first_name} ${user.last_name}` : "John Doe"}</p>
                  <p className="text-soil-300">{user ? user.role : "Farm Manager"}</p>
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-white border border-gray-200 shadow-lg" align="end">
              <DropdownMenuItem className="cursor-pointer text-gray-700 hover:text-soil-600">
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default Header;
