import { useAcademic } from "../../contexts/AcademicContext";
import AssignmentCard from "./AssignmentCard";

import styles from "./Assignments.module.css";

export default function AssignmentSection({ group }) {
    const { groupedAssignments } = useAcademic();
    return (
        <>
            <tbody className={styles.sectionMargin}>
                <tr></tr>
            </tbody>
            <tbody className={styles.sectionContent}>
                <tr
                    style={{
                        height: "0.5em"
                    }}>
                    <td
                        style={{
                            position: "absolute",
                            top: 0,
                            translate: "0 -60%",
                            padding: "0",
                            paddingInline: "0.15em",
                            left: "0.75em",
                            background: "var(--background-color)"
                            // fontWeight: "bold"
                        }}>
                        {group}
                    </td>
                </tr>
                {/* <ul className={styles.assignmentSectionList}> */}
                {groupedAssignments[group].map((x, i) => (
                    <AssignmentCard key={x.uuid} assignment={x} />
                ))}
                {/* </ul> */}
                <tr
                    style={{
                        height: "0.625em"
                    }}></tr>
            </tbody>
        </>
    );
}
