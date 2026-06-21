import { Clock } from "lucide-react";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";

export default function Page() {
  return (
    <div>
      <PageHeader title="Reports" description="Your uploaded medical reports." />
      <EmptyState
        icon={Clock}
        title="Coming soon"
        description="This screen will be wired up to the MediVault API in the next iteration."
      />
    </div>
  );
}
