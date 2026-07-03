import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";

const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "dark";
    const updateTheme = (currTheme: string) => {
      const isLight =
        currTheme === "light" ||
        (currTheme === "system" && !window.matchMedia("(prefers-color-scheme: dark)").matches);

      if (isLight) {
        document.documentElement.classList.add("light");
      } else {
        document.documentElement.classList.remove("light");
      }
    };

    updateTheme(savedTheme);

    if (savedTheme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const listener = () => {
        updateTheme("system");
      };
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
