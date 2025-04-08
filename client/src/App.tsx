import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import Home from "@/pages/home";
import Discover from "@/pages/discover";
import Chat from "@/pages/chat";
import ChatDetail from "@/pages/chat-detail";
import Profile from "@/pages/profile";
import StoryView from "@/pages/story-view";
import Booking from "@/pages/booking";
import Matches from "@/pages/matches";
import Onboarding from "@/pages/onboarding";
import NotFound from "@/pages/not-found";

function Router() {
  const [location] = useLocation();

  return (
    <Switch location={location}>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/" component={Home} />
      <Route path="/discover" component={Discover} />
      <Route path="/chat" component={Chat} />
      <Route path="/chat/:id" component={ChatDetail} />
      <Route path="/profile" component={Profile} />
      <Route path="/profile/:id" component={Profile} />
      <Route path="/story/:id" component={StoryView} />
      <Route path="/booking/:id" component={Booking} />
      <Route path="/matches" component={Matches} />
      <Route path="/onboarding" component={Onboarding} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
