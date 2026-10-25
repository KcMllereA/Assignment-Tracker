import { NavLink } from "react-router-dom";

import styles from "./Components.module.css";

export default function NavBar({ children }) {
    return (
        <>
            <nav className={styles.navBar} aria-label="Main navigation">
                <ul>
                    <li>
                        <NavLink className={({ isActive }) => isActive ? styles.activeNav : undefined} to="/">Assignments</NavLink>
                    </li>
                    <li>
                        <NavLink className={({ isActive }) => isActive ? styles.activeNav : undefined} to="/calendar">Calendar</NavLink>
                    </li>
                    <li>
                        <NavLink className={({ isActive }) => isActive ? styles.activeNav : undefined} to="/classes">Classes</NavLink>
                    </li>
                    <li>
                        <NavLink className={({ isActive }) => isActive ? styles.activeNav : undefined} to="/grades">Grades</NavLink>
                    </li>
                    <li>
                        <NavLink className={({ isActive }) => isActive ? styles.activeNav : undefined} to="/settings">Settings</NavLink>
                    </li>
                </ul>
            </nav>
            <main className={styles.main}>{children}</main>
        </>
    );
}
