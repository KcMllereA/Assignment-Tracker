import { useState } from "react";
import AssignmentForm from "../../components/AssignmentForm";
import { useAcademic } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import AssignmentSection from "./AssignmentSection";
import { SECTIONS } from "../../logic/assignments";
import { useModal } from "../../contexts/ModalContext";

const SECTION_ORDER = [SECTIONS.OVERDUE, SECTIONS.ACTIVE, SECTIONS.NOT_OPEN, SECTIONS.COMPLETE, SECTIONS.DROPPED];

export default function Assignments() {
    const {
        academicData: { assignments },
        actions: { addAssignment },
        groupedAssignments
    } = useAcademic();
    const [showModal, closeModal] = useModal();
    debugging.log("obtained assignments:", assignments, groupedAssignments);
    return (
        <>
            <h1>Assignments</h1>
            {SECTION_ORDER.map((group) => {
                return group in groupedAssignments && <AssignmentSection key={group} group={group} />;
            })}

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
        </>
    );
}
