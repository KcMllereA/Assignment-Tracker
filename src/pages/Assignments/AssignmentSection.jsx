import { memo } from "react";
import AssignmentCard from "./AssignmentCard";

import styles from "./Assignments.module.css";
import { useAcademicActions, useAcademicStore } from "../../contexts/AcademicContext";

export default memo(function AssignmentSection({ group }) {
    const { toggleOpenSection } = useAcademicActions();
    const assignments = useAcademicStore((s) => s.groupedAssignments[group]);
    const open = useAcademicStore((s) => s.user.openedSections[group]);
    if (!assignments || assignments.length == 0) return null;
    return (
        <>
            <tbody className={styles.sectionMargin} aria-hidden="true">
                <tr></tr>
            </tbody>
            <tbody className={styles.sectionContent} data-closed={!open} aria-label={`${group} assignments`}>
                <tr>
                    <td onClick={() => toggleOpenSection(group, !open)}>
                        [{open ? "-" : "+"}] {group}({assignments.length})
                    </td>
                </tr>
                {assignments.map((uuid) => (
                    <AssignmentCard key={uuid} uuid={uuid} group={group} />
                ))}
                <tr style={{ height: "0.5ch" }}></tr>
            </tbody>
        </>
    );
});
