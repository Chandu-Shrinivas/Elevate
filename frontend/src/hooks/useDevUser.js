/**
 * Safe Clerk hook wrappers.
 * In dev mode (no Clerk key), returns a demo user stub.
 * In production mode, proxies to the real Clerk hooks.
 */
import { isDevMode } from "@/utils/devMode";
import { useUser } from "@clerk/clerk-react";

const DEMO_USER = {
    id: "demo_user",
    firstName: "Demo",
    lastName: "User",
    fullName: "Demo User",
    primaryEmailAddress: { emailAddress: "demo@elevate.ai" },
    imageUrl: null,
};

export function useDevUser() {
    if (isDevMode) {
        return { user: DEMO_USER, isLoaded: true, isSignedIn: true };
    }
    
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useUser();
}

