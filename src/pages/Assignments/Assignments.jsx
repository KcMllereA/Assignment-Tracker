import { useEffect } from "react";
import AssignmentForm from "./AssignmentForm";
import { useAcademic } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import AssignmentSection from "./AssignmentSection";
import { SECTIONS } from "../../logic/assignments";
import { useModal } from "../../contexts/ModalContext";

import styles from "./Assignments.module.css";

const SECTION_ORDER = [SECTIONS.OVERDUE, SECTIONS.ACTIVE, SECTIONS.NOT_OPEN, SECTIONS.COMPLETE, SECTIONS.DROPPED];

export default function Assignments() {
    const {
        academicData: { assignments },
        actions: { addAssignment },
        groupedAssignments
    } = useAcademic();
    const [showModal, closeModal] = useModal();
    useEffect(() => {
        debugging.log("obtained assignments:", assignments, groupedAssignments);
    }, [styles]);
    return (
        <>
            <h1>Assignments</h1>

            <button
                onClick={() => {
                    showModal(
                        <AssignmentForm
                            onComplete={(assignment) => {
                                addAssignment(assignment);
                                closeModal(false);
                            }}
                        />
                    );
                }}>
                Add assignment
            </button>

            <table className={styles.sectionWrapper} aria-label="Assignments">
                {SECTION_ORDER.map((group) => {
                    return group in groupedAssignments && <AssignmentSection key={group} group={group} />;
                })}
            </table>
        </>
    );
}
