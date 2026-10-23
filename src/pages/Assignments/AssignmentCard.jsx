import { useState } from "react";
import useNow from "../../contexts/useNow";
import { formatRelativeTime } from "../../util/time";
import { useAcademic } from "../../contexts/AcademicContext";
import AssignmentForm from "../../components/AssignmentForm";
import { useModal } from "../../contexts/ModalContext";

export default function AssignmentCard({ assignment }) {
    const now = useNow();
    const {
        actions: { updateAssignment }
    } = useAcademic();
    const [showModal, closeModal] = useModal();
    return (
        <li>
            <details>
                <summary>
                    {assignment.status} | {assignment.name} | {assignment.type} | Due {formatRelativeTime(assignment.dueDate - now)}
                </summary>
                other details
                <br />
                <button
                    onClick={() =>
                        showModal(
                            <AssignmentForm
                                onComplete={(data) => {
                                    updateAssignment(assignment.uuid, data);
                                    closeModal();
                                }}
                                currentData={assignment}
                            />
                        )
                    }>
                    edit button
                </button>
                or so here
            </details>
        </li>
    );
}
