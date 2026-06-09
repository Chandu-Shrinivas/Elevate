import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

const isValidClerkKey =
  clerkPubKey &&
  clerkPubKey !== "your-clerk-publishable-key" &&
  clerkPubKey !== "your-clerk-publishable-key-here" &&
  clerkPubKey.startsWith("pk_");

console.log("[Elevate AI] REACT_APP_BACKEND_URL:", process.env.REACT_APP_BACKEND_URL || "(not set)");
console.log("[Elevate AI] Clerk key:", isValidClerkKey ? "configured" : "(not set — DEV MODE)");

if (!isValidClerkKey) {
  console.warn("[Elevate AI] Clerk key missing. Running in DEV MODE.");
}

const root = ReactDOM.createRoot(document.getElementById("root"));

if (isValidClerkKey) {
  // ── Production: ClerkProvider wraps everything ──────────────────────────────
  // ClerkProvider must be OUTSIDE BrowserRouter so it can provide Clerk context
  // to ALL components (including UserButton in Header).
  // routing="hash" on SignIn/SignUp prevents Clerk from conflicting with React Router.
  root.render(
    <React.StrictMode>
      <ClerkProvider publishableKey={clerkPubKey}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    </React.StrictMode>
  );
} else {
  // ── Dev Mode: no Clerk ───────────────────────────────────────────────────────
  root.render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
}
