import { useEffect, useState } from "react";
import AppRouter from "./routing/AppRouter";

/**
 * TanStack Start renders on the server. react-router-dom's BrowserRouter
 * needs `window`. Render only after mount so SSR returns a neutral shell
 * and the SPA hydrates on the client.
 */
export default function ClientApp() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
      </div>
    );
  }

  return <AppRouter />;
}