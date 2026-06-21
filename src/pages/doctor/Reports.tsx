import { Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";

export default function Page() {
  return (
    <div>
      <PageHeader title="Reports" description="Upload medical reports for your patients." />
      <EmptyState
        icon={Clock}
        title="Coming soon"
        description="This screen will be wired up to the MediVault API in the next iteration."
      />
    </div>
  );
}
