import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Mail, Search, Send, Users } from "lucide-react";
import { toast } from "sonner";

import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import { patientsService } from "../../services/patients";
import { accessRequestsService } from "../../services/accessRequests";
import StatusBadge from "../../components/StatusBadge";
import { extractApiError } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Card, CardContent } from "../../components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../../components/ui/table";

export default function DoctorPatientsPage() {
  const [input, setInput] = useState("");
  const [q, setQ] = useState("");
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["patients", "search", q],
    queryFn: () => patientsService.search(q),
    enabled: q.length > 0,
  });

  const historyQuery = useQuery({
    queryKey: ["access-requests", "history"],
    queryFn: () => accessRequestsService.history(),
  });

  const activeByPatient = useMemo(() => {
    const map = new Map<number, "PENDING" | "APPROVED">();
    for (const item of historyQuery.data ?? []) {
      if (item.status === "PENDING" || item.status === "APPROVED") {
        map.set(item.patient_id, item.status);
      }
    }
    return map;
  }, [historyQuery.data]);

  const sendMutation = useMutation({
    mutationFn: (patientId: number) => accessRequestsService.send(patientId),
    onSuccess: () => {
      toast.success("Access request sent");
      queryClient.invalidateQueries({ queryKey: ["access-requests", "history"] });
    },
    onError: (err) => {
      toast.error(extractApiError(err, "Couldn't send access request."));
    },
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setQ(trimmed);
  };

  return (
    <div>
      <PageHeader
        title="Find Patients"
        description="Search patients by full name or email address."
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="q">Search query</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="q"
                  className="pl-9"
                  placeholder="Name or email…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  required
                  minLength={1}
                />
              </div>
            </div>
            <div className="flex items-end">
              <Button type="submit" disabled={!input.trim()}>
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {!q && (
        <EmptyState
          icon={Users}
          title="Search to get started"
          description="Enter a patient name or email above to find a patient."
        />
      )}

      {q && query.isLoading && <LoadingState label="Searching patients…" />}
      {q && query.error && (
        <ErrorState
          message={extractApiError(query.error, "Couldn't load patients.")}
          onRetry={() => query.refetch()}
        />
      )}
      {q && query.data && query.data.length === 0 && (
        <EmptyState
          icon={Users}
          title="No patients found"
          description={`No patient matched "${q}". Try a different name or email.`}
        />
      )}
      {q && query.data && query.data.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Patient ID</TableHead>
                    <TableHead className="text-right">Access</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {query.data.map((p) => {
                    const active = activeByPatient.get(p.id);
                    const pending =
                      sendMutation.isPending && sendMutation.variables === p.id;
                    return (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.full_name}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                            <Mail className="h-3.5 w-3.5" />
                            {p.email}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">#{p.id}</TableCell>
                        <TableCell className="text-right">
                          {active ? (
                            <StatusBadge status={active} />
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={pending || historyQuery.isLoading}
                              onClick={() => sendMutation.mutate(p.id)}
                            >
                              <Send className="mr-2 h-3.5 w-3.5" />
                              {pending ? "Sending…" : "Request access"}
                            </Button>
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
    </div>
  );
}
