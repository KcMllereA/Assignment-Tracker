import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, createHashRouter, RouterProvider, Navigate } from "react-router-dom";

import Assignments from "./pages/Assignments/Assignments";
import Calendar from "./pages/Calendar/Calendar";
import Classes from "./pages/Classes/Classes";
import Grades from "./pages/Grades/Grades";
import Settings from "./pages/Settings/Settings";

import "./index.css";

const routes = [
    { path: "/", element: <Assignments /> },
    { path: "/calendar", element: <Calendar /> },
    { path: "/classes", element: <Classes /> },
    { path: "/grades", element: <Grades /> },
    { path: "/settings", element: <Settings /> },

    { path: "*", element: <Navigate to="/" replace /> }
];

const isHash = import.meta.env.MODE === "github";

if (isHash) {
    const base = import.meta.env.BASE_URL;
    const cleanBase = base.replace(/\/$/, "");
    const cleanPath = window.location.pathname.replace(/\/$/, "");

    if (cleanPath !== cleanBase) {
        window.location.replace(base);
    }
}

const router = isHash ? createHashRouter(routes) : createBrowserRouter(routes, { basename: import.meta.env.BASE_URL });

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <RouterProvider router={router} />
    </StrictMode>
);
