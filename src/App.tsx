import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    // SnapFlip is permanently in Dark Mode. Ensure light theme classes are cleared.
    document.documentElement.classList.remove("light");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
