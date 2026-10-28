import { useCallback, useEffect } from "react";
import AssignmentForm from "./AssignmentForm";
import { useAcademicActions, useAcademicStore } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import AssignmentSection from "./AssignmentSection";
import { SECTIONS } from "../../logic/assignments";
import { useModal } from "../../contexts/ModalContext";

import styles from "./Assignments.module.css";

const SECTION_ORDER = [SECTIONS.STALLED, SECTIONS.OVERDUE, SECTIONS.ACTIVE, SECTIONS.NOT_OPEN, SECTIONS.COMPLETE, SECTIONS.DROPPED];

export default function Assignments() {
    const groupedAssignments = useAcademicStore((s) => s?.groupedAssignments);
    const assignments = useAcademicStore((s) => s?.assignments);
    const openedSections = useAcademicStore((s) => s?.user.openedSections);
    const { addAssignment } = useAcademicActions();
    const { showModal } = useModal();
    useEffect(() => {
        debugging.log("obtained assignments:", assignments, groupedAssignments);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const openAssignmentForm = useCallback(() => {
        showModal(AssignmentForm, {
            onComplete: addAssignment
        });
    }, [addAssignment, showModal]);
    return (
        <>
            <h1>Assignments</h1>

            <button onClick={openAssignmentForm}>Add assignment</button>

            <table className={styles.sectionWrapper} aria-label="Assignments">
                {SECTION_ORDER.map((group) => {
                    return group in groupedAssignments && <AssignmentSection key={group} group={group} open={openedSections[group]} assignments={groupedAssignments[group]} />;
                })}
            </table>
        </>
    );
}
