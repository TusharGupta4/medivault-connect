import { Badge } from "./ui/badge";
import type { AccessStatus } from "../services/accessRequests";
import { CheckCircle2, Clock, XCircle, Ban } from "lucide-react";

const MAP: Record<
  AccessStatus,
  { label: string; className: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  PENDING: {
    label: "Pending",
    className: "bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200",
    Icon: Clock,
  },
  APPROVED: {
    label: "Approved",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200",
    Icon: CheckCircle2,
  },
  REJECTED: {
    label: "Rejected",
    className: "bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200",
    Icon: XCircle,
  },
  REVOKED: {
    label: "Revoked",
    className: "bg-slate-200 text-slate-800 hover:bg-slate-200 border-slate-300",
    Icon: Ban,
  },
};

export default function StatusBadge({ status }: { status: AccessStatus }) {
  const cfg = MAP[status];
  const Icon = cfg.Icon;
  return (
    <Badge variant="outline" className={`gap-1 font-medium ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}