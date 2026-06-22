import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, Check, X, Ban } from "lucide-react";
import { toast } from "sonner";

import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";
import {
  accessRequestsService,
  type AccessStatus,
  type IncomingAccessRequest,
} from "../../services/accessRequests";
import { extractApiError } from "../../api/client";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";

function fmt(value: string) {
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

type Pending = {
  request: IncomingAccessRequest;
  next: Extract<AccessStatus, "REJECTED" | "REVOKED">;
};

export default function PatientAccessRequestsPage() {
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<Pending | null>(null);

  const query = useQuery({
    queryKey: ["access-requests", "incoming"],
    queryFn: () => accessRequestsService.listIncoming(),
  });

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: AccessStatus }) =>
      accessRequestsService.updateStatus(id, status),
    onSuccess: (_data, vars) => {
      const label =
        vars.status === "APPROVED"
          ? "Access approved"
          : vars.status === "REJECTED"
            ? "Request rejected"
            : "Access revoked";
      toast.success(label);
      queryClient.invalidateQueries({ queryKey: ["access-requests", "incoming"] });
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Couldn't update request."));
    },
  });

  const pendingFor = (id: number) =>
    mutation.isPending && mutation.variables?.id === id;

  return (
    <div>
      <PageHeader
        title="Access Requests"
        description="Approve, reject, or revoke doctor access to your medical records."
      />

      {query.isLoading && <LoadingState label="Loading access requests…" />}
      {query.error && (
        <ErrorState
          message={extractApiError(query.error, "Couldn't load access requests.")}
          onRetry={() => query.refetch()}
        />
      )}
      {query.data && query.data.length === 0 && (
        <EmptyState
          icon={ShieldCheck}
          title="No access requests"
          description="When a doctor requests access to your records, it will appear here."
        />
      )}
      {query.data && query.data.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Doctor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.map((req) => {
                    const busy = pendingFor(req.id);
                    return (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">
                          Doctor #{req.doctor}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={req.status} />
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {fmt(req.created_at)}
                        </TableCell>
                        <TableCell className="text-right">
                          {req.status === "PENDING" && (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                disabled={busy}
                                onClick={() =>
                                  mutation.mutate({ id: req.id, status: "APPROVED" })
                                }
                              >
                                <Check className="mr-1.5 h-3.5 w-3.5" />
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={busy}
                                onClick={() =>
                                  setConfirm({ request: req, next: "REJECTED" })
                                }
                              >
                                <X className="mr-1.5 h-3.5 w-3.5" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {req.status === "APPROVED" && (
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={busy}
                              onClick={() =>
                                setConfirm({ request: req, next: "REVOKED" })
                              }
                            >
                              <Ban className="mr-1.5 h-3.5 w-3.5" />
                              Revoke
                            </Button>
                          )}
                          {(req.status === "REJECTED" || req.status === "REVOKED") && (
                            <span className="text-xs text-muted-foreground">
                              No actions available
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <AlertDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm?.next === "REVOKED"
                ? "Revoke doctor access?"
                : "Reject this access request?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirm?.next === "REVOKED"
                ? "The doctor will immediately lose access to your medical records. You can grant access again later by approving a new request."
                : "The doctor will not receive access. They can send a new request if needed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!confirm) return;
                mutation.mutate({ id: confirm.request.id, status: confirm.next });
                setConfirm(null);
              }}
              className={
                confirm?.next === "REVOKED"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {confirm?.next === "REVOKED" ? "Revoke access" : "Reject request"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}