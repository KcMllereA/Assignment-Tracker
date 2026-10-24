import { useState } from "react";
import useNow from "../../contexts/useNow";
import { formatRelativeTime } from "../../util/time";
import { useAcademic } from "../../contexts/AcademicContext";
import AssignmentForm from "../../components/AssignmentForm";
import { useModal } from "../../contexts/ModalContext";
import { getSection, SECTIONS } from "../../logic/assignments";

import styles from "./Assignments.module.css";

export default function AssignmentCard({ assignment }) {
    const now = useNow();
    const {
        actions: { updateAssignment, deleteAssignment }
    } = useAcademic();
    const [showModal, closeModal] = useModal();
    const section = getSection(assignment, Date.now());
    const [open, setOpen] = useState(false);
    return (
        <>
            <tr className={styles.assignmentCard} onClick={() => setOpen(!open)}>
                <td>{assignment.status}</td>
                <td>{assignment.name}</td>
                <td>{assignment.type}</td>
                <td>{section == SECTIONS.NOT_OPEN ? "Open " + formatRelativeTime(assignment.openDate - now) : "Due " + formatRelativeTime(assignment.dueDate - now)}</td>
            </tr>
            <tr className={styles.assignmentInformation} open={open}>
                <td colSpan={4}>
                    {assignment.description}
                    <div>
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
                        <button
                            onClick={() => {
                                deleteAssignment(assignment.uuid);
                            }}>
                            delete
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
}
