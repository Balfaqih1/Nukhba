import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import React from "react";
import { isLoggedIn } from "@/lib/storage";

import { Layout } from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Participants from "@/pages/Participants";
import ParticipantForm from "@/pages/ParticipantForm";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component, params }: { component: React.ComponentType<any>; params?: any }) {
  const [, setLocation] = useLocation();
  const loggedIn = isLoggedIn();

  React.useEffect(() => {
    if (!loggedIn) {
      setLocation("/login");
    }
  }, [loggedIn, setLocation]);

  if (!loggedIn) return null;

  return (
    <Layout>
      <Component params={params} />
    </Layout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/participants" component={() => <ProtectedRoute component={Participants} />} />
      <Route path="/participants/new" component={() => <ProtectedRoute component={ParticipantForm} />} />
      <Route path="/participants/:id/edit" component={(params) => <ProtectedRoute component={ParticipantForm} params={params} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
