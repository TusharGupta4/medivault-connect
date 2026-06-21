import { Outlet } from "react-router-dom";
import Brand from "../components/Brand";

export default function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
        <Brand />
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold leading-tight">
            Your medical record,
            <br />
            secure and in your hands.
          </h1>
          <p className="max-w-md text-sm text-primary-foreground/80">
            MediVault gives patients and clinicians a single trusted place to
            share prescriptions, reports and emergency information — with full
            control over who can see what.
          </p>
        </div>
        <p className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} MediVault. All rights reserved.
        </p>
      </div>
      <div className="flex items-center justify-center bg-background px-4 py-10 sm:px-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Brand />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}