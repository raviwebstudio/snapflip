import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import ErrorBoundary from "./components/common/ErrorBoundary";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // SnapFlip is permanently in Dark Mode. Ensure light theme classes are cleared.
    document.documentElement.classList.remove("light");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <RouterProvider router={router} />
      </ErrorBoundary>
    </QueryClientProvider>
  );
}
