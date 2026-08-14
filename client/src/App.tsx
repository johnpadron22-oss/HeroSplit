import { lazy, Suspense } from "react";
import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Lazy-loaded pages — each becomes its own JS chunk, keeping the
// initial bundle small. The loading fallback is the same spinner
// the auth check already shows, so there's no visible flash.
const Home        = lazy(() => import("@/pages/Home"));
const Landing     = lazy(() => import("@/pages/Landing"));
const WorkoutView = lazy(() => import("@/pages/WorkoutView"));
const NotFound    = lazy(() => import("@/pages/not-found"));

function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
    </div>
  );
}

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <PageLoader />;

  return (
    <Suspense fallback={<PageLoader />}>
      <Switch>
        <Route path="/landing">
          {isAuthenticated ? <Redirect to="/" /> : <Landing />}
        </Route>

        <Route path="/">
          {isAuthenticated ? <Home /> : <Redirect to="/landing" />}
        </Route>

        <Route path="/workout/:slug">
          {isAuthenticated ? <WorkoutView /> : <Redirect to="/landing" />}
        </Route>

        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <TooltipProvider>
      <Router />
      <Toaster />
    </TooltipProvider>
  );
}

export default App;
