import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../../services/auth";
import { useAuth } from "../../hooks/useAuth";
import { dashboardPathFor, Role, type UserRole } from "../../utils/roles";
import { extractApiError } from "../../api/client";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(Role.PATIENT);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await authService.register(email.trim(), password, role);
      toast.success("Account created");
      // Auto-login for convenience
      try {
        const me = await login(email.trim(), password);
        navigate(dashboardPathFor(me.role), { replace: true });
      } catch {
        navigate("/login", { replace: true });
      }
    } catch (err) {
      toast.error(extractApiError(err, "Registration failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground">Create your account</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Join MediVault as a patient or healthcare provider.
      </p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label>I am a</Label>
          <RadioGroup
            value={role}
            onValueChange={(v) => setRole(v as UserRole)}
            className="grid grid-cols-2 gap-3"
          >
            {[
              { value: Role.PATIENT, label: "Patient" },
              { value: Role.DOCTOR, label: "Doctor" },
            ].map((opt) => (
              <label
                key={opt.value}
                htmlFor={`role-${opt.value}`}
                className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-3 text-sm transition-colors ${
                  role === opt.value
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border hover:bg-accent"
                }`}
              >
                <RadioGroupItem id={`role-${opt.value}`} value={opt.value} />
                {opt.label}
              </label>
            ))}
          </RadioGroup>
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
        </div>
        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}