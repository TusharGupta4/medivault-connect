import {
  UserCog,
  Stethoscope,
  ShieldCheck,
  PhoneCall,
  FileText,
  Pill,
} from "lucide-react";
import PageHeader from "../../components/PageHeader";
import DashboardCard from "../../components/DashboardCard";
import { useAuth } from "../../hooks/useAuth";

export default function PatientDashboard() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader
        title={`Welcome back${user?.email ? `, ${user.email.split("@")[0]}` : ""}`}
        description="Manage your medical profile, control doctor access, and view your records."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DashboardCard to="/patient/profile" title="My Profile" icon={UserCog}
          description="Keep your personal and medical details up to date." />
        <DashboardCard to="/patient/doctors" title="Find Doctors" icon={Stethoscope}
          description="Search verified doctors by name or specialization." />
        <DashboardCard to="/patient/access-requests" title="Access Requests" icon={ShieldCheck}
          description="Approve or revoke doctor access to your records." />
        <DashboardCard to="/patient/emergency-contacts" title="Emergency Contacts" icon={PhoneCall}
          description="Designate trusted contacts for emergencies." />
        <DashboardCard to="/patient/reports" title="Reports" icon={FileText}
          description="View your uploaded medical reports." />
        <DashboardCard to="/patient/prescriptions" title="Prescriptions" icon={Pill}
          description="Review prescriptions from your doctors." />
      </div>
    </div>
  );
}