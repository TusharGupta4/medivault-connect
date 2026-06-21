import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Hospital, Search, Stethoscope, X } from "lucide-react";

import PageHeader from "../../components/PageHeader";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import EmptyState from "../../components/EmptyState";
import {
  doctorsService, SPECIALIZATIONS, type Specialization,
} from "../../services/doctors";
import { extractApiError } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Card, CardContent } from "../../components/ui/card";

const ANY = "ANY";

export default function PatientDoctorsPage() {
  const [nameInput, setNameInput] = useState("");
  const [specInput, setSpecInput] = useState<Specialization | typeof ANY>(ANY);
  const [filters, setFilters] = useState<{ name: string; specialization: Specialization | "" }>({
    name: "",
    specialization: "",
  });

  const query = useQuery({
    queryKey: ["doctors", "search", filters],
    queryFn: () => doctorsService.search(filters),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setFilters({
      name: nameInput.trim(),
      specialization: specInput === ANY ? "" : specInput,
    });
  };

  const clear = () => {
    setNameInput("");
    setSpecInput(ANY);
    setFilters({ name: "", specialization: "" });
  };

  const hasActiveFilters = !!filters.name || !!filters.specialization;

  return (
    <div>
      <PageHeader
        title="Find Doctors"
        description="Search MediVault's network of verified doctors."
      />

      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={submit} className="grid gap-4 sm:grid-cols-[1fr_220px_auto]">
            <div className="space-y-1.5">
              <Label htmlFor="doctor-name">Doctor name</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="doctor-name"
                  className="pl-9"
                  placeholder="e.g. Amit"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Specialization</Label>
              <Select value={specInput} onValueChange={(v) => setSpecInput(v as Specialization | typeof ANY)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY}>Any specialization</SelectItem>
                  {SPECIALIZATIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2">
              <Button type="submit" className="flex-1 sm:flex-none">
                <Search className="mr-2 h-4 w-4" /> Search
              </Button>
              {hasActiveFilters && (
                <Button type="button" variant="ghost" onClick={clear}>
                  <X className="mr-1 h-4 w-4" /> Clear
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      {query.isLoading && <LoadingState label="Searching doctors…" />}
      {query.error && (
        <ErrorState
          message={extractApiError(query.error, "Couldn't load doctors.")}
          onRetry={() => query.refetch()}
        />
      )}
      {query.data && query.data.length === 0 && (
        <EmptyState
          icon={Stethoscope}
          title="No doctors found"
          description={
            hasActiveFilters
              ? "Try adjusting your filters or clearing them to see all doctors."
              : "There are no doctors in the directory yet."
          }
        />
      )}
      {query.data && query.data.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {query.data.map((d) => (
            <Card key={d.id} className="transition-shadow hover:shadow-md">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {d.full_name}
                    </h3>
                    <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Hospital className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{d.hospital_name}</span>
                    </p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 gap-1">
                    <Stethoscope className="h-3 w-3" />
                    {d.specialization}
                  </Badge>
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  {d.experience_years} years of experience
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
