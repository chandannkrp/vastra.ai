import { Route, Routes } from "react-router-dom";
import { PipelineDock } from "./components/PipelineDock";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { useAuth } from "./lib/auth";
import AdminDashboard from "./pages/AdminDashboard";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SellerDashboard from "./pages/SellerDashboard";

export default function App() {
  const { role } = useAuth();

  return (
    <>
      <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="seller">
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Landing />} />
      </Routes>
      {/* The agent studio dock only makes sense while a seller is signed in and
          actually has work running — never on public/marketing pages. */}
      {role === "seller" && <PipelineDock />}
    </>
  );
}
