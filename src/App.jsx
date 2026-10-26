import { BrowserRouter, HashRouter, Routes, Route, Navigate } from "react-router-dom";

import { AcademicProvider } from "./contexts/AcademicProvider";
import { ModalProvider } from "./contexts/ModalProvider";

import NavBar from "./components/NavBar";

import Assignments from "./pages/Assignments/Assignments";
import Calendar from "./pages/Calendar/Calendar";
import Classes from "./pages/Classes/Classes";
import Grades from "./pages/Grades/Grades";
import Settings from "./pages/Settings/Settings";

import "./index.css";

const isHash = import.meta.env.MODE === "github";

if (isHash) {
    const base = import.meta.env.BASE_URL;
    const cleanBase = base.replace(/\/$/, "");
    const cleanPath = window.location.pathname.replace(/\/$/, "");

    if (cleanPath !== cleanBase) {
        window.location.replace(base);
    }
}

const Router = isHash ? HashRouter : BrowserRouter;

export default function App() {
    return (
        <AcademicProvider>
            <ModalProvider>
                <Router basename={isHash ? undefined : import.meta.env.BASE_URL}>
                    <NavBar>
                        <Routes>
                            <Route path="/" element={<Assignments />} />
                            <Route path="/calendar" element={<Calendar />} />
                            <Route path="/classes" element={<Classes />} />
                            <Route path="/grades" element={<Grades />} />
                            <Route path="/settings" element={<Settings />} />

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                    </NavBar>
                </Router>
            </ModalProvider>
        </AcademicProvider>
    );
}
