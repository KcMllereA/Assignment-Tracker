import { Link } from "react-router-dom";

import styles from "./Components.module.css";

export default function NavBar({ children }) {
    return (
        <>
            <nav class={styles.navBar}>
                <ul>
                    <li>
                        <Link to="/">Assignments</Link>
                    </li>
                    <li>
                        <Link to="/calendar">Calendar</Link>
                    </li>
                    <li>
                        <Link to="/classes">Classes</Link>
                    </li>
                    <li>
                        <Link to="/grades">Grades</Link>
                    </li>
                    <li>
                        <Link to="/settings">Settings</Link>
                    </li>
                </ul>
            </nav>
            <main class={styles.main}>{children}</main>
        </>
    );
}
