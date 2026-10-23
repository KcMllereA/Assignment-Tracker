import { useAcademic } from "../../contexts/AcademicContext";
import AssignmentCard from "./AssignmentCard";

import styles from "./Assignments.module.css";

export default function AssignmentSection({ group }) {
    const { groupedAssignments } = useAcademic();
    return (
        <fieldset key={group}>
            <legend>{group}</legend>
            <ul className={styles.assignmentSectionList}>
                {groupedAssignments[group].map((x, i) => (
                    <AssignmentCard key={i} assignment={x} />
                ))}
            </ul>
        </fieldset>
    );
}
