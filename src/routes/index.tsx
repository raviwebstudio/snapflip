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
import Playground from "../pages/Playground";

export const router = createBrowserRouter([
  {
    element: <LandingLayout />,
    children: [
      {
        path: "/",
        element: <Landing />,
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
        path: "/create",
        element: <CreateAlbum />,
      },
      {
        path: "/settings",
        element: <Settings />,
      },
    ],
  },
  {
    path: "/view/:slug",
    element: <Viewer />,
  },
  {
    path: "/pricing",
    element: <Pricing />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/playground",
    element: <Playground />,
  },
]);
