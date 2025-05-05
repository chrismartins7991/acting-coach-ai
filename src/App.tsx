
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { PostHogPageTracker } from "./components/providers/PostHogPageTracker";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import History from "./pages/History";
import ChatPage from "./pages/ChatPage";
import UploadPage from "./pages/UploadPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import LastResults from "./pages/LastResults";
import { OnboardingFlow } from "./components/onboarding/OnboardingFlow";
import SelfTapeStudioPage from "./pages/SelfTapeStudioPage";
import RehearsalRoomPage from "./pages/RehearsalRoomPage";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

// Protected Route wrapper component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <PostHogPageTracker />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/welcome" element={<OnboardingFlow startStep="welcome" />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/history"
              element={
                <ProtectedRoute>
                  <History />
                </ProtectedRoute>
              }
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <ChatPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <UploadPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/last-results"
              element={
                <ProtectedRoute>
                  <LastResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/self-tape-studio"
              element={
                <ProtectedRoute>
                  <SelfTapeStudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/rehearsal-room"
              element={
                <ProtectedRoute>
                  <RehearsalRoomPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
          </Routes>
          <Toaster />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
