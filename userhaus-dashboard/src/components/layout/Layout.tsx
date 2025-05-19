import { ReactNode } from "react";
import { Outlet } from "react-router-dom"; // ✅ Import Outlet
import Header from "./Header";
interface DashboardLayoutProps {
  
  isLoggedIn: boolean;
  userRole: string | null;
}
const Layout =({  isLoggedIn, userRole }: DashboardLayoutProps) => {
  return (
    <div className="min-h-screen">
      <Header  isLoggedIn={isLoggedIn} userRole={userRole}/>
      <main className="pt-16">
        <Outlet /> {/* ✅ This allows nested routes to be rendered inside Layout */}
      </main>
    </div>
  );
};

export default Layout;
