import { HeartPulse } from "lucide-react";

export default function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <HeartPulse className="h-5 w-5" />
      </div>
      {!compact && (
        <div className="flex flex-col leading-tight">
          <span className="text-base font-semibold text-foreground">MediVault</span>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Secure Health Records
          </span>
        </div>
      )}
    </div>
  );
}