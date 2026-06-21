import {
  UserCog,
  Users,
  History,
  FileText,
  Pill,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import { useAuth } from "../../hooks/useAuth";

export default function DoctorDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader
        title={`Welcome, Dr. ${user?.email ? user.email.split("@")[0] : ""}`}
        description="Search patients, manage access, and upload reports or prescriptions."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard to="/doctor/profile" title="My Profile" icon={UserCog}
          description="Manage your professional information and credentials." />
        <DashboardCard to="/doctor/patients" title="Find Patients" icon={Users}
          description="Search patients and request access to their records." />
        <DashboardCard to="/doctor/access-history" title="Access History" icon={History}
          description="Review the status of your access requests." />
        <DashboardCard to="/doctor/reports" title="Reports" icon={FileText}
          description="Upload medical reports for your patients." />
        <DashboardCard to="/doctor/prescriptions" title="Prescriptions" icon={Pill}
          description="Create and manage prescriptions for patients." />
      </div>
    </div>
  );
}