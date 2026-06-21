import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { Role } from "../utils/roles";
import { Toaster } from "../components/ui/sonner";

import ProtectedRoute from "./ProtectedRoute";
import PublicOnlyRoute from "./PublicOnlyRoute";

import AuthLayout from "../layouts/AuthLayout";
import PatientLayout from "../layouts/PatientLayout";
import DoctorLayout from "../layouts/DoctorLayout";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";
import RoleRedirect from "../pages/RoleRedirect";

import PatientDashboard from "../pages/patient/Dashboard";
import PatientProfile from "../pages/patient/Profile";
import PatientDoctors from "../pages/patient/Doctors";
import PatientAccessRequests from "../pages/patient/AccessRequests";
import PatientEmergencyContacts from "../pages/patient/EmergencyContacts";
import PatientReports from "../pages/patient/Reports";
import PatientPrescriptions from "../pages/patient/Prescriptions";

import DoctorDashboard from "../pages/doctor/Dashboard";
import DoctorProfile from "../pages/doctor/Profile";
import DoctorPatients from "../pages/doctor/Patients";
import DoctorAccessHistory from "../pages/doctor/AccessHistory";
import DoctorReports from "../pages/doctor/Reports";
import DoctorPrescriptions from "../pages/doctor/Prescriptions";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster />
        <Routes>
          <Route path="/" element={<RoleRedirect />} />

          <Route element={<PublicOnlyRoute />}>
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>
          </Route>

          <Route path="/unauthorized" element={<Unauthorized />} />

          <Route element={<ProtectedRoute allowedRoles={[Role.PATIENT]} />}>
            <Route path="/patient" element={<PatientLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<PatientDashboard />} />
              <Route path="profile" element={<PatientProfile />} />
              <Route path="doctors" element={<PatientDoctors />} />
              <Route path="access-requests" element={<PatientAccessRequests />} />
              <Route path="emergency-contacts" element={<PatientEmergencyContacts />} />
              <Route path="reports" element={<PatientReports />} />
              <Route path="prescriptions" element={<PatientPrescriptions />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={[Role.DOCTOR]} />}>
            <Route path="/doctor" element={<DoctorLayout />}>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<DoctorDashboard />} />
              <Route path="profile" element={<DoctorProfile />} />
              <Route path="patients" element={<DoctorPatients />} />
              <Route path="access-history" element={<DoctorAccessHistory />} />
              <Route path="reports" element={<DoctorReports />} />
              <Route path="prescriptions" element={<DoctorPrescriptions />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}