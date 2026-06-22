import { useQuery } from "@tanstack/react-query";
import { History } from "lucide-react";

import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import { accessRequestsService } from "../../services/accessRequests";
import { extractApiError } from "../../api/client";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";

function fmt(value: string | null) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function DoctorAccessHistoryPage() {
  const query = useQuery({
    queryKey: ["access-requests", "history"],
    queryFn: () => accessRequestsService.history(),
  });

  return (
    <div>
      <PageHeader
        title="Access History"
        description="All access requests you have sent to patients."
      />

      {query.isLoading && <LoadingState label="Loading access history…" />}
      {query.error && (
        <ErrorState
          message={extractApiError(query.error, "Couldn't load access history.")}
          onRetry={() => query.refetch()}
        />
      )}
      {query.data && query.data.length === 0 && (
        <EmptyState
          icon={History}
          title="No access requests yet"
          description="When you request access to a patient, it will appear here."
        />
      )}
      {query.data && query.data.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead>Approved</TableHead>
                    <TableHead>Ended</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.patient_name}
                        <span className="ml-2 text-xs text-muted-foreground">
                          #{item.patient_id}
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={item.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmt(item.created_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmt(item.approved_at)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {fmt(item.ended_at)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}