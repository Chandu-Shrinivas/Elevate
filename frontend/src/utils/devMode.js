/**
 * Dev mode detection utility.
 * Checks REACT_APP_CLERK_PUBLISHABLE_KEY directly from process.env
 * so it works at module load time (before index.js sets window flags).
 */

const clerkKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;

export const isDevMode =
    !clerkKey ||
    clerkKey === "your-clerk-publishable-key" ||
    clerkKey === "your-clerk-publishable-key-here" ||
    !clerkKey.startsWith("pk_");
