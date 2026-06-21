import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import axios from "axios";
import {
  Award, Briefcase, Hospital, MapPin, Phone, Stethoscope, User as UserIcon,
} from "lucide-react";

import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import {
  doctorsService, SPECIALIZATIONS, type DoctorProfile,
} from "../../services/doctors";
import { extractApiError } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

const schema = z.object({
  full_name: z.string().trim().min(2, "Full name is required").max(120),
  specialization: z.enum(SPECIALIZATIONS),
  hospital_name: z.string().trim().min(2, "Hospital name is required").max(200),
  experience_years: z.coerce.number().int().min(0).max(80),
  phone_number: z.string().trim().regex(/^\d{10,15}$/, "Enter a valid phone number"),
  license_number: z.string().trim().min(2, "License number is required").max(50),
  address: z.string().trim().min(2, "Address is required").max(500),
});
type FormValues = z.infer<typeof schema>;

export default function DoctorProfilePage() {
  const qc = useQueryClient();
  const query = useQuery<DoctorProfile, unknown>({
    queryKey: ["doctor", "profile"],
    queryFn: doctorsService.getMyProfile,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 1;
    },
  });

  if (query.isLoading) {
    return (
      <div>
        <PageHeader title="My Profile" description="Manage your professional information." />
        <LoadingState label="Loading your profile…" />
      </div>
    );
  }

  const isNotFound = axios.isAxiosError(query.error) && query.error.response?.status === 404;

  if (query.error && !isNotFound) {
    return (
      <div>
        <PageHeader title="My Profile" />
        <ErrorState
          message={extractApiError(query.error, "Couldn't load your profile.")}
          onRetry={() => query.refetch()}
        />
      </div>
    );
  }

  if (!query.data) {
    return (
      <div>
        <PageHeader
          title="Set up your doctor profile"
          description="Add your credentials so patients can find and trust you."
        />
        <CreateForm onCreated={(p) => qc.setQueryData(["doctor", "profile"], p)} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="My Profile" description="Your professional information on file." />
      <ProfileView profile={query.data} />
    </div>
  );
}

function ProfileView({ profile }: { profile: DoctorProfile }) {
  const items = [
    { icon: UserIcon, label: "Full name", value: profile.full_name },
    { icon: Hospital, label: "Hospital", value: profile.hospital_name },
    { icon: Briefcase, label: "Experience", value: `${profile.experience_years} years` },
    { icon: Phone, label: "Phone", value: profile.phone_number },
    { icon: Award, label: "License", value: profile.license_number },
    { icon: MapPin, label: "Address", value: profile.address, full: true },
  ];
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>{profile.full_name}</CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">{profile.hospital_name}</p>
        </div>
        <Badge variant="secondary" className="gap-1">
          <Stethoscope className="h-3 w-3" />
          {profile.specialization}
        </Badge>
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

function CreateForm({ onCreated }: { onCreated: (p: DoctorProfile) => void }) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      full_name: "",
      specialization: "GENERAL",
      hospital_name: "",
      experience_years: 0,
      phone_number: "",
      license_number: "",
      address: "",
    },
  });

  const mutation = useMutation({
    mutationFn: doctorsService.createMyProfile,
    onSuccess: (data) => {
      toast.success("Profile created");
      onCreated(data);
    },
    onError: (err) => toast.error(extractApiError(err, "Couldn't create profile")),
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={form.handleSubmit((v) => mutation.mutate(v))} className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={form.formState.errors.full_name?.message}>
              <Input placeholder="Dr Amit Sharma" {...form.register("full_name")} />
            </Field>
            <Field label="Specialization" error={form.formState.errors.specialization?.message}>
              <Select
                value={form.watch("specialization")}
                onValueChange={(v) =>
                  form.setValue("specialization", v as FormValues["specialization"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SPECIALIZATIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Hospital name" error={form.formState.errors.hospital_name?.message}>
              <Input placeholder="Apollo Hospital" {...form.register("hospital_name")} />
            </Field>
            <Field label="Years of experience" error={form.formState.errors.experience_years?.message}>
              <Input type="number" min={0} max={80} {...form.register("experience_years")} />
            </Field>
            <Field label="Phone number" error={form.formState.errors.phone_number?.message}>
              <Input placeholder="9876543210" {...form.register("phone_number")} />
            </Field>
            <Field label="License number" error={form.formState.errors.license_number?.message}>
              <Input placeholder="DOC12345" {...form.register("license_number")} />
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
