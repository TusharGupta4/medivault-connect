import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <ShieldAlert className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account doesn't have permission to view this page.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to safety</Link>
        </Button>
      </div>
    </div>
  );
}