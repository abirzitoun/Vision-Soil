import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Register from "./pages/Register";
import Index from "./pages/Index";
import FarmSelection from "./pages/Engineer/FarmSelection";
import FarmDashboard from "./pages/Engineer/FarmDashboard";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import RobotSelection from "./pages/Engineer/RobotSelection";
import Farmer from "./pages/Farmer/Farmer";
import Layout from "@/components/layout/Layout";
import ProtectedRoute from "./pages/ProtectedRoute";
import Dashboard from "./pages/Admin/Admin";

// ✅ Import missing components
import RobotManagement from "./pages/Admin/RobotManagement";
import FarmManagement from "./pages/Admin/FarmManagement";
import UserManagement from "./pages/Admin/UserManagement";
import Report from "@/components/Engineer/ReportDownloader";
import Reportf from "@/components/Farmer/ReportDownloaderFarmer";


const queryClient = new QueryClient();

const App = () => {
  const isLoggedIn = localStorage.getItem("loggedIn") === "true"; // ✅ Simplified
  const userRole = localStorage.getItem("userRole") || "";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes (Requires Authentication) */}
            {isLoggedIn ? (
              // All routes will be wrapped inside the Layout if logged in
              <Route element={<Layout isLoggedIn={isLoggedIn} userRole={userRole} />}>
                {/* Engineer Routes */}
                <Route element={<ProtectedRoute allowedRoles={["engineer"]} />}>
                  <Route path="/farm-selection" element={<FarmSelection />} />
                  <Route path="/dashboard/:farmId" element={<FarmDashboard />} />
                  <Route path="/engineer" element={<RobotSelection />} />
                  <Route path="/report/:farmId" element={<Report />} />
                </Route>

                {/* Farmer Routes */}
                <Route element={<ProtectedRoute allowedRoles={["farmer"]} />}>
                  <Route path="/farmer" element={<Farmer />} />
                  <Route path="/reportf/:farmId" element={<Reportf />} />

                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
                  <Route path="/admin" element={<Dashboard />} />
                  <Route path="/admin/robots" element={<RobotManagement />} />
                  <Route path="/admin/farms" element={<FarmManagement />} />
                  <Route path="/admin/users" element={<UserManagement />} />
                </Route>
              </Route>
            ) : (
              // Redirect to Login if Not Authenticated
              <Route path="*" element={<Navigate to="/login" replace />} />
            )}

            {/* Catch-All Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
