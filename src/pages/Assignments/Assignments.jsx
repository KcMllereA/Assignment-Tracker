import { memo, useCallback, useEffect } from "react";
import AssignmentForm from "./AssignmentForm";
import { useAcademicActions } from "../../contexts/AcademicContext";
import AssignmentSection from "./AssignmentSection";
import { SECTIONS } from "../../logic/assignments";
import { useModal } from "../../contexts/ModalContext";

import styles from "./Assignments.module.css";
import useNow from "../../hooks/useNow";

const SECTION_ORDER = [SECTIONS.STALLED, SECTIONS.OVERDUE, SECTIONS.ACTIVE, SECTIONS.NOT_OPEN, SECTIONS.COMPLETE, SECTIONS.DROPPED];

const SectionRefresher = memo(function SectionRefresher() {
    const { refreshSections } = useAcademicActions();
    const now = useNow();
    useEffect(() => {
        refreshSections(now);
    }, [refreshSections, now]);
});

export default function Assignments() {
    const { addAssignment } = useAcademicActions();
    const { showModal } = useModal();
    const openAssignmentForm = useCallback(() => {
        showModal(AssignmentForm, {
            onComplete: addAssignment,
            title: "New Assignment"
        });
    }, [addAssignment, showModal]);

    return (
        <>
            <SectionRefresher />
            <h1>Assignments</h1>

            <button onClick={openAssignmentForm}>Add assignment</button>

            <table className={styles.sectionWrapper} aria-label="Assignments">
                {SECTION_ORDER.map((group) => (
                    <AssignmentSection key={group} group={group} />
                ))}
            </table>
        </>
    );
}
