import { useAcademic } from "../../contexts/AcademicContext";
import AssignmentCard from "./AssignmentCard";

import styles from "./Assignments.module.css";

export default function AssignmentSection({ group }) {
    const {
        groupedAssignments,
        academicData: { user },
        actions: { toggleOpenSection }
    } = useAcademic();

    const open = user[group];

    return (
        <>
            <tbody className={styles.sectionMargin} aria-hidden="true">
                <tr></tr>
            </tbody>
            <tbody className={styles.sectionContent} data-closed={!open} aria-label={`${group} assignments`}>
                <tr>
                    <td onClick={() => toggleOpenSection(group, !open)}>
                        [{open ? "-" : "+"}] {group}({groupedAssignments[group].length})
                    </td>
                </tr>
                {groupedAssignments[group].map((x) => (
                    <AssignmentCard key={x.uuid} assignment={x} />
                ))}
                <tr
                    style={{
                        height: "0.5ch"
                    }}></tr>
            </tbody>
        </>
    );
}
