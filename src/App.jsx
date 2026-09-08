import "./App.css";

import Navbar from "./components/navbar";
import CustomerProfile from "./pages/customer/CustomerProfile.jsx";

import Home from "./pages/Home.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import WorkerProfile from "./pages/WorkerProfile.jsx";
import FindServices from "./pages/FindServices.jsx";
import ServiceDetails from "./pages/ServiceDetails.jsx";
import WorkerDashboard from "./pages/WorkerDashboard.jsx";
import WorkerMatching from "./pages/WorkerMatching.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import WorkerWelfare from "./pages/WorkerWelfare.jsx";

import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/profile" element={<CustomerProfile />} />
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/worker-profile"
          element={<WorkerProfile />}
        />

        <Route
          path="/find-services"
          element={<FindServices />}
        />

        <Route
          path="/service-details"
          element={<ServiceDetails />}
        />

        <Route
          path="/worker-matching"
          element={<WorkerMatching />}
        />

        <Route
          path="/worker-dashboard"
          element={<WorkerDashboard />}
        />

        <Route
          path="/admin-dashboard"
          element={<AdminDashboard />}
        />

        <Route
          path="/worker-welfare"
          element={<WorkerWelfare />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;