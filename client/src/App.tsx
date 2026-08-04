import { Switch, Route, Redirect } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import NotFound from "@/pages/not-found";

// Pages
import Home from "@/pages/Home";
import Landing from "@/pages/Landing";
import WorkoutView from "@/pages/WorkoutView";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
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
