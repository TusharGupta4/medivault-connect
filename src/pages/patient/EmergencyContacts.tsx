import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  Check,
  HeartPulse,
  Inbox,
  LogOut,
  Mail,
  Plus,
  Trash2,
  UserMinus,
  Users,
  X,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import { extractApiError } from "../../api/client";
import {
  emergencyContactsService,
  RELATIONS,
  type Relation,
} from "../../services/emergencyContacts";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
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

const addSchema = z.object({
  email: z.string().trim().email("Enter a valid email address"),
  relation: z.enum(RELATIONS),
});
type AddValues = z.infer<typeof addSchema>;

type ConfirmAction =
  | { kind: "direct-remove"; id: number; label: string }
  | { kind: "request-removal"; id: number; label: string }
  | { kind: "approve-removal"; id: number; label: string }
  | { kind: "reject-removal"; id: number; label: string }
  | { kind: "reject-request"; id: number; label: string };

export default function EmergencyContactsPage() {
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<ConfirmAction | null>(null);

  const contactsQuery = useQuery({
    queryKey: ["emergency-contacts", "list"],
    queryFn: () => emergencyContactsService.list(),
  });
  const incomingQuery = useQuery({
    queryKey: ["emergency-contacts", "incoming"],
    queryFn: () => emergencyContactsService.listIncomingRequests(),
  });
  const removalsQuery = useQuery({
    queryKey: ["emergency-contacts", "removals"],
    queryFn: () => emergencyContactsService.listRemovalRequests(),
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["emergency-contacts"] });
  };

  const form = useForm<AddValues>({
    resolver: zodResolver(addSchema),
    defaultValues: { email: "", relation: "FATHER" },
  });

  const sendRequest = useMutation({
    mutationFn: (input: AddValues) =>
      emergencyContactsService.sendRequest(input),
    onSuccess: () => {
      toast.success("Request sent");
      form.reset({ email: "", relation: "FATHER" });
      invalidateAll();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Couldn't send request.")),
  });

  const respondRequest = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "ACCEPTED" | "REJECTED";
    }) => emergencyContactsService.respondToRequest(id, status),
    onSuccess: (_d, vars) => {
      toast.success(vars.status === "ACCEPTED" ? "Request accepted" : "Request rejected");
      invalidateAll();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Couldn't update request.")),
  });

  const directRemove = useMutation({
    mutationFn: (id: number) => emergencyContactsService.directRemove(id),
    onSuccess: () => {
      toast.success("Emergency contact removed");
      invalidateAll();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Couldn't remove contact.")),
  });

  const requestRemoval = useMutation({
    mutationFn: (id: number) => emergencyContactsService.requestRemoval(id),
    onSuccess: () => {
      toast.success("Removal request sent");
      invalidateAll();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Couldn't send removal request.")),
  });

  const respondRemoval = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: number;
      status: "APPROVED" | "REJECTED";
    }) => emergencyContactsService.respondToRemoval(id, status),
    onSuccess: (_d, vars) => {
      toast.success(
        vars.status === "APPROVED" ? "Removal approved" : "Removal rejected",
      );
      invalidateAll();
    },
    onError: (err) =>
      toast.error(extractApiError(err, "Couldn't update removal request.")),
  });

  const onSubmit = form.handleSubmit((values) => sendRequest.mutate(values));

  const myContacts = contactsQuery.data?.my_emergency_contacts ?? [];
  const patientsWhoAddedMe = contactsQuery.data?.patients_who_added_me ?? [];
  const incoming = incomingQuery.data ?? [];
  const removals = removalsQuery.data ?? [];

  const incomingCount = incoming.filter((r) => r.status === "PENDING").length;
  const removalsCount = removals.filter((r) => r.status === "PENDING").length;

  const handleConfirm = () => {
    if (!confirm) return;
    switch (confirm.kind) {
      case "direct-remove":
        directRemove.mutate(confirm.id);
        break;
      case "request-removal":
        requestRemoval.mutate(confirm.id);
        break;
      case "approve-removal":
        respondRemoval.mutate({ id: confirm.id, status: "APPROVED" });
        break;
      case "reject-removal":
        respondRemoval.mutate({ id: confirm.id, status: "REJECTED" });
        break;
      case "reject-request":
        respondRequest.mutate({ id: confirm.id, status: "REJECTED" });
        break;
    }
    setConfirm(null);
  };

  return (
    <div>
      <PageHeader
        title="Emergency Contacts"
        description="Manage trusted people who can approve doctor access during emergencies."
      />

      <Tabs defaultValue="contacts" className="space-y-4">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="contacts" className="gap-2">
            <Users className="h-4 w-4" /> My Contacts
          </TabsTrigger>
          <TabsTrigger value="add" className="gap-2">
            <Plus className="h-4 w-4" /> Add Contact
          </TabsTrigger>
          <TabsTrigger value="incoming" className="gap-2">
            <Inbox className="h-4 w-4" /> Incoming
            {incomingCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {incomingCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="removals" className="gap-2">
            <UserMinus className="h-4 w-4" /> Removal Requests
            {removalsCount > 0 && (
              <Badge variant="secondary" className="ml-1">
                {removalsCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="helping" className="gap-2">
            <HeartPulse className="h-4 w-4" /> Patients I Help
          </TabsTrigger>
        </TabsList>

        {/* MY CONTACTS */}
        <TabsContent value="contacts" className="space-y-4">
          {contactsQuery.isLoading && <LoadingState label="Loading contacts…" />}
          {contactsQuery.error && (
            <ErrorState
              message={extractApiError(contactsQuery.error, "Couldn't load contacts.")}
              onRetry={() => contactsQuery.refetch()}
            />
          )}
          {contactsQuery.data && myContacts.length === 0 && (
            <EmptyState
              icon={Users}
              title="No emergency contacts yet"
              description="Add a trusted person who can approve doctor access on your behalf."
            />
          )}
          {myContacts.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {myContacts.map((c) => (
                <Card key={c.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{c.email}</CardTitle>
                        <CardDescription className="mt-1 flex items-center gap-1">
                          <Mail className="h-3 w-3" /> Emergency contact
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{c.relation}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full"
                      onClick={() =>
                        setConfirm({
                          kind: "direct-remove",
                          id: c.id,
                          label: c.email,
                        })
                      }
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Remove
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ADD */}
        <TabsContent value="add">
          <Card className="max-w-xl">
            <CardHeader>
              <CardTitle>Add an emergency contact</CardTitle>
              <CardDescription>
                The user will receive a request and must accept it before becoming your contact.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="person@example.com"
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Relation</Label>
                  <Select
                    value={form.watch("relation")}
                    onValueChange={(v) =>
                      form.setValue("relation", v as Relation, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={sendRequest.isPending}>
                  <Plus className="mr-1.5 h-4 w-4" />
                  {sendRequest.isPending ? "Sending…" : "Send request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INCOMING */}
        <TabsContent value="incoming" className="space-y-4">
          {incomingQuery.isLoading && <LoadingState label="Loading requests…" />}
          {incomingQuery.error && (
            <ErrorState
              message={extractApiError(incomingQuery.error, "Couldn't load requests.")}
              onRetry={() => incomingQuery.refetch()}
            />
          )}
          {incomingQuery.data && incoming.length === 0 && (
            <EmptyState
              icon={Inbox}
              title="No incoming requests"
              description="When a patient asks you to be their emergency contact, it will show here."
            />
          )}
          {incoming.length > 0 && (
            <div className="grid gap-3">
              {incoming.map((r) => {
                const busy =
                  respondRequest.isPending && respondRequest.variables?.id === r.id;
                return (
                  <Card key={r.id}>
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{r.patient_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Wants you as their <span className="font-medium">{r.relation}</span>
                        </p>
                      </div>
                      {r.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              respondRequest.mutate({ id: r.id, status: "ACCEPTED" })
                            }
                          >
                            <Check className="mr-1.5 h-3.5 w-3.5" /> Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({
                                kind: "reject-request",
                                id: r.id,
                                label: r.patient_name,
                              })
                            }
                          >
                            <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline">{r.status}</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* REMOVAL REQUESTS (patient side) */}
        <TabsContent value="removals" className="space-y-4">
          {removalsQuery.isLoading && <LoadingState label="Loading removal requests…" />}
          {removalsQuery.error && (
            <ErrorState
              message={extractApiError(removalsQuery.error, "Couldn't load removal requests.")}
              onRetry={() => removalsQuery.refetch()}
            />
          )}
          {removalsQuery.data && removals.length === 0 && (
            <EmptyState
              icon={UserMinus}
              title="No removal requests"
              description="If an emergency contact asks to be removed, you can approve or reject it here."
            />
          )}
          {removals.length > 0 && (
            <div className="grid gap-3">
              {removals.map((r) => {
                const busy =
                  respondRemoval.isPending && respondRemoval.variables?.id === r.id;
                return (
                  <Card key={r.id}>
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-medium">{r.contact_name}</p>
                        <p className="text-sm text-muted-foreground">
                          Requested to be removed from your emergency contacts
                        </p>
                      </div>
                      {r.status === "PENDING" ? (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({
                                kind: "approve-removal",
                                id: r.id,
                                label: r.contact_name,
                              })
                            }
                          >
                            <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={busy}
                            onClick={() =>
                              setConfirm({
                                kind: "reject-removal",
                                id: r.id,
                                label: r.contact_name,
                              })
                            }
                          >
                            <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline">{r.status}</Badge>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* PATIENTS WHO ADDED ME (contact side) */}
        <TabsContent value="helping" className="space-y-4">
          {contactsQuery.isLoading && <LoadingState label="Loading…" />}
          {contactsQuery.data && patientsWhoAddedMe.length === 0 && (
            <EmptyState
              icon={HeartPulse}
              title="You're not an emergency contact yet"
              description="When a patient adds you as their emergency contact, they will appear here."
            />
          )}
          {patientsWhoAddedMe.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {patientsWhoAddedMe.map((p) => (
                <Card key={p.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <CardTitle className="text-base">{p.patient_name}</CardTitle>
                        <CardDescription className="mt-1">
                          You are their emergency contact
                        </CardDescription>
                      </div>
                      <Badge variant="outline">{p.relation}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      disabled={
                        requestRemoval.isPending &&
                        requestRemoval.variables === p.id
                      }
                      onClick={() =>
                        setConfirm({
                          kind: "request-removal",
                          id: p.id,
                          label: p.patient_name,
                        })
                      }
                    >
                      <LogOut className="mr-1.5 h-3.5 w-3.5" />
                      Request removal
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={confirm !== null}
        onOpenChange={(o) => !o && setConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{titleFor(confirm)}</AlertDialogTitle>
            <AlertDialogDescription>{descFor(confirm)}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              className={
                confirm?.kind === "direct-remove" || confirm?.kind === "approve-removal"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {ctaFor(confirm)}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function titleFor(c: ConfirmAction | null) {
  switch (c?.kind) {
    case "direct-remove":
      return "Remove this emergency contact?";
    case "request-removal":
      return "Request removal?";
    case "approve-removal":
      return "Approve removal?";
    case "reject-removal":
      return "Reject removal?";
    case "reject-request":
      return "Reject this request?";
    default:
      return "";
  }
}

function descFor(c: ConfirmAction | null) {
  switch (c?.kind) {
    case "direct-remove":
      return `${c.label} will immediately lose emergency contact privileges. You can add them again later.`;
    case "request-removal":
      return `${c.label} will need to approve before you are removed as their emergency contact.`;
    case "approve-removal":
      return `${c.label} will be removed from your emergency contacts.`;
    case "reject-removal":
      return `${c.label} will remain as your emergency contact.`;
    case "reject-request":
      return `${c.label} will not be added as your emergency contact. They can send a new request later.`;
    default:
      return "";
  }
}

function ctaFor(c: ConfirmAction | null) {
  switch (c?.kind) {
    case "direct-remove":
      return "Remove";
    case "request-removal":
      return "Send request";
    case "approve-removal":
      return "Approve & remove";
    case "reject-removal":
      return "Reject";
    case "reject-request":
      return "Reject";
    default:
      return "Confirm";
  }
}