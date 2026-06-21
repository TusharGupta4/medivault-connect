import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";
import {
  Calendar, Droplet, MapPin, Phone, ShieldAlert, User as UserIcon,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import {
  BLOOD_GROUPS, GENDERS, patientsService, type PatientProfile,
} from "../../services/patients";
import { extractApiError } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const schema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(120),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  gender: z.enum(GENDERS),
  blood_group: z.enum(BLOOD_GROUPS),
  phone_number: z.string().trim().regex(/^\d{10,15}$/, "Enter a valid phone number"),
  address: z.string().trim().min(2, "Address is required").max(500),
  emergency_contact: z
    .string()
    .trim()
    .regex(/^\d{10,15}$/, "Enter a valid emergency contact number"),
});
type FormValues = z.infer<typeof schema>;

export default function PatientProfilePage() {
  const qc = useQueryClient();
  const query = useQuery<PatientProfile, unknown>({
    queryKey: ["patient", "profile"],
    queryFn: patientsService.getMyProfile,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

  if (query.isLoading) {
    return (
      <div>
        <PageHeader title="My Profile" description="View and update your patient profile." />
        <LoadingState label="Loading your profile…" />
      </div>
    );
  }

  const error = query.error;
  const isNotFound =
    axios.isAxiosError(error) && error.response?.status === 404;

  if (error && !isNotFound) {
    return (
      <div>
        <PageHeader title="My Profile" />
        <ErrorState
          message={extractApiError(error, "Couldn't load your profile.")}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  if (!query.data) {
    return (
      <div>
        <PageHeader
          title="Create your profile"
          description="Tell us a bit about yourself so doctors can provide better care."
        />
        <CreateProfileForm
          onCreated={(p) => {
            qc.setQueryData(["patient", "profile"], p);
          }}
        />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="My Profile"
        description="Your personal and medical information on file."
      />
      <ProfileView profile={query.data} />
    </div>
  );
}

function ProfileView({ profile }: { profile: PatientProfile }) {
  const items = [
    { icon: UserIcon, label: "Full name", value: profile.full_name },
    { icon: Calendar, label: "Date of birth", value: profile.date_of_birth },
    { icon: UserIcon, label: "Gender", value: profile.gender },
    { icon: Droplet, label: "Blood group", value: profile.blood_group },
    { icon: Phone, label: "Phone", value: profile.phone_number },
    { icon: ShieldAlert, label: "Emergency contact", value: profile.emergency_contact },
    { icon: MapPin, label: "Address", value: profile.address, full: true },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>{profile.full_name}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-5 sm:grid-cols-2">
          {items.map((it) => (
            <div key={it.label} className={it.full ? "sm:col-span-2" : undefined}>
              <dt className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <it.icon className="h-3.5 w-3.5" />
                {it.label}
              </dt>
              <dd className="mt-1 text-sm text-foreground">{it.value}</dd>
            </div>
          ))}
        </dl>
      </CardContent>
    </Card>
  );
}

function CreateProfileForm({ onCreated }: { onCreated: (p: PatientProfile) => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      date_of_birth: "",
      gender: "MALE",
      blood_group: "O+",
      phone_number: "",
      address: "",
      emergency_contact: "",
    },
  });

  const mutation = useMutation({
    mutationFn: patientsService.createMyProfile,
    onSuccess: (data) => {
      toast.success("Profile created");
      onCreated(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Couldn't create profile")),
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={form.formState.errors.full_name?.message}>
              <Input placeholder="Tushar Gupta" {...form.register("full_name")} />
            </Field>
            <Field label="Date of birth" error={form.formState.errors.date_of_birth?.message}>
              <Input type="date" {...form.register("date_of_birth")} />
            </Field>
            <Field label="Gender" error={form.formState.errors.gender?.message}>
              <Select
                value={form.watch("gender")}
                onValueChange={(v) => form.setValue("gender", v as FormValues["gender"], { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {GENDERS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Blood group" error={form.formState.errors.blood_group?.message}>
              <Select
                value={form.watch("blood_group")}
                onValueChange={(v) => form.setValue("blood_group", v as FormValues["blood_group"], { shouldValidate: true })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {BLOOD_GROUPS.map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Phone number" error={form.formState.errors.phone_number?.message}>
              <Input placeholder="9876543210" {...form.register("phone_number")} />
            </Field>
            <Field
              label="Emergency contact"
              error={form.formState.errors.emergency_contact?.message}
            >
              <Input placeholder="9876543211" {...form.register("emergency_contact")} />
            </Field>
          </div>
          <Field label="Address" error={form.formState.errors.address?.message}>
            <Textarea rows={3} placeholder="Mumbai, India" {...form.register("address")} />
          </Field>
          <div className="flex justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Create profile"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label, error, children,
}: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
