import { trpc } from "@/lib/trpc";
import { tokenStore } from "@/lib/tokenStore";
import { UNAUTHED_ERR_MSG } from '@shared/const';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink, TRPCClientError } from "@trpc/client";
import { createRoot } from "react-dom/client";
import superjson from "superjson";
import App from "./App";
import "./index.css";
import { LanguageProvider } from "./contexts/LanguageContext";

const queryClient = new QueryClient();

const redirectToLoginIfUnauthorized = (error: unknown) => {
  if (!(error instanceof TRPCClientError)) return;
  if (typeof window === "undefined") return;

  const isUnauthorized = error.message === UNAUTHED_ERR_MSG;

  if (!isUnauthorized) return;

  // Clear stored token and redirect to login
  tokenStore.clear();
  if (window.location.pathname !== "/login" && window.location.pathname !== "/signup") {
    window.location.href = "/login";
  }
};

// Expected user-facing error codes that should NOT be logged as console errors
const EXPECTED_ERROR_CODES = new Set(["CONFLICT", "UNAUTHORIZED", "BAD_REQUEST", "FORBIDDEN"]);

const isExpectedError = (error: unknown): boolean => {
  if (!(error instanceof TRPCClientError)) return false;
  const code = (error.data as { code?: string } | undefined)?.code;
  return code ? EXPECTED_ERROR_CODES.has(code) : false;
};

queryClient.getQueryCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.query.state.error;
    redirectToLoginIfUnauthorized(error);
    if (!isExpectedError(error)) {
      console.error("[API Query Error]", error);
    }
  }
});

queryClient.getMutationCache().subscribe(event => {
  if (event.type === "updated" && event.action.type === "error") {
    const error = event.mutation.state.error;
    redirectToLoginIfUnauthorized(error);
    if (!isExpectedError(error)) {
      console.error("[API Mutation Error]", error);
    }
  }
});

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: "/api/trpc",
      transformer: superjson,
      fetch(input, init) {
        // Attach Authorization Bearer header if we have a stored token
        const token = tokenStore.get();
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
        return globalThis.fetch(input, {
          ...(init ?? {}),
          credentials: "include",
          headers: {
            ...(init?.headers as Record<string, string> ?? {}),
            ...headers,
          },
        });
      },
    }),
  ],
});

createRoot(document.getElementById("root")!).render(
  <trpc.Provider client={trpcClient} queryClient={queryClient}>
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </QueryClientProvider>
  </trpc.Provider>
);
