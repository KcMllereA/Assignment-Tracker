import { memo } from "react";
import AssignmentCard from "./AssignmentCard";

import styles from "./Assignments.module.css";
import { useAcademicActions, useAcademicStore } from "../../contexts/AcademicContext";

export default memo(function AssignmentSection({ group, open, assignments: uuids }) {
    const { toggleOpenSection } = useAcademicActions();
    const assignments = useAcademicStore(s => s.assignments);
    return (
        <>
            <tbody className={styles.sectionMargin} aria-hidden="true">
                <tr></tr>
            </tbody>
            <tbody className={styles.sectionContent} data-closed={!open} aria-label={`${group} assignments`}>
                <tr>
                    <td onClick={() => toggleOpenSection(group, !open)}>
                        [{open ? "-" : "+"}] {group}({uuids.length})
                    </td>
                </tr>
                {uuids.map((uuid) => (
                    <AssignmentCard key={uuid} assignment={assignments[uuid]} group={group} />
                ))}
                <tr
                    style={{
                        height: "0.5ch"
                    }}></tr>
            </tbody>
        </>
    );
});
