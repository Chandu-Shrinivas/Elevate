import "@/App.css";
import { Routes, Route, useLocation, Navigate, useNavigate } from "react-router-dom";
import Header from "@/components/custom/Header";
import Dashboard from "@/pages/Dashboard";
import CodingPage from "@/pages/CodingPage";
import AptitudePage from "@/pages/AptitudePage";
import CommunicationPage from "@/pages/CommunicationPage";
import ProfileAnalyticsPage from "@/pages/ProfileAnalyticsPage";
import SignUpPage from "@/pages/SignUpPage";
import SignInPage from "@/pages/SignInPage";
import { Toaster } from "@/components/ui/sonner";
import React, { useEffect } from "react";
import { isDevMode } from "@/utils/devMode";
// Static import — same webpack module instance as ClerkProvider in index.js
import { useAuth } from "@clerk/clerk-react";

// AuthenticatedRoute: always calls useAuth() — Rules of Hooks satisfied.
// Only rendered when ClerkProvider IS present (isDevMode=false).
function AuthenticatedRoute({ children }) {
  const navigate = useNavigate();
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) navigate("/sign-in", { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  if (!isLoaded) return null;  // Clerk still initialising
  if (!isSignedIn) return null; // Redirect fires in useEffect

  return <>{children}</>;
}

// ProtectedRoute: dev mode passthrough, or real auth check.
// Splitting into two components keeps hook calls unconditional.
function ProtectedRoute({ children }) {
  if (isDevMode) return <>{children}</>;
  return <AuthenticatedRoute>{children}</AuthenticatedRoute>;
}


// ──────────────────────────────────────────────────────────────────────────────
// AppLayout
// ──────────────────────────────────────────────────────────────────────────────
function AppLayout() {
  const location = useLocation();
  const isAuthPage =
    location.pathname.startsWith("/sign-up") ||
    location.pathname.startsWith("/sign-in");

  return (
    <div className="min-h-screen bg-[#050505]">
      {!isAuthPage && <Header />}
      <main className={isAuthPage ? "" : "pt-20"}>
        <Routes>
          {/* ── Auth Routes (public) ── */}
          <Route
            path="/sign-in/*"
            element={isDevMode ? <Navigate to="/" replace /> : <SignInPage />}
          />
          <Route
            path="/sign-up/*"
            element={isDevMode ? <Navigate to="/" replace /> : <SignUpPage />}
          />

          {/* ── Protected Routes ── */}
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/coding" element={<ProtectedRoute><CodingPage /></ProtectedRoute>} />
          <Route path="/aptitude" element={<ProtectedRoute><AptitudePage /></ProtectedRoute>} />
          <Route path="/communication" element={<ProtectedRoute><CommunicationPage /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><ProfileAnalyticsPage /></ProtectedRoute>} />

          {/* ── Catch-all: send unknown routes to sign-in (or home in dev) ── */}
          <Route
            path="*"
            element={<Navigate to={isDevMode ? "/" : "/sign-in"} replace />}
          />
        </Routes>
      </main>
      <Toaster position="bottom-right" theme="dark" />
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
