import { createBrowserRouter } from "react-router-dom";
import LandingLayout from "../layouts/LandingLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import Landing from "../pages/Landing";
import Dashboard from "../pages/Dashboard";
import CreateAlbum from "../pages/CreateAlbum";
import Viewer from "../pages/Viewer";
import Pricing from "../pages/Pricing";
import Search from "../pages/Search";
import Settings from "../pages/Settings";
import Analytics from "../pages/Analytics";
import About from "../pages/About";
import Contact from "../pages/Contact";

export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      {
        path: "/",
        element: <Landing />,
      },
      {
        path: "/about",
        element: <About />,
      },
      {
        path: "/contact",
        element: <Contact />,
      },
    ],
  },
  {
    element: <DashboardLayout />,
    children: [
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/analytics",
        element: <Analytics />,
      },
      {
        path: "/create",
        element: <CreateAlbum />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
      {
        path: "/pricing",
        element: <Pricing />,
      },
    ],
  },
  {
    path: "/view/:slug",
    element: <Viewer />,
  },
  {
    path: "/search",
    element: <Search />,
  },
]);
