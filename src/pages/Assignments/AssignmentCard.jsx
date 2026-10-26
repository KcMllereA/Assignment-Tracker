import useNow from "../../hooks/useNow";
import { formatRelativeTime } from "../../util/time";
import { useAcademic } from "../../contexts/AcademicContext";
import AssignmentForm from "./AssignmentForm";
import { useModal } from "../../contexts/ModalContext";
import { getDueDateMix, getSection, SECTIONS, STATUS_COLORS, STATUSES } from "../../logic/assignments";
import { useAssignmentDetails } from "../../hooks/stores";

import styles from "./Assignments.module.css";
import { useId } from "react";

export default function AssignmentCard({ assignment }) {
    const popoverId = useId();
    const anchorName = "--" + popoverId;
    const now = useNow();
    const {
        actions: { updateAssignment, deleteAssignment },
        academicData: { classes }
    } = useAcademic();
    const thisUUID = assignment.uuid;
    const { showModal, closeModal } = useModal();
    const section = getSection(assignment, now);
    const isOpen = section != SECTIONS.NOT_OPEN;
    const isComplete = section == SECTIONS.COMPLETE;
    const assignmentDate = (isOpen ? assignment.dueDate : assignment.openDate) - now;

    const [openedAssignment, setOpenedAssignment] = useAssignmentDetails();

    const open = openedAssignment == thisUUID;
    return (
        <>
            <tr
                className={styles.assignmentCard}
                aria-expanded={open}
                aria-controls={`${thisUUID}-details`}
                onClick={(e) => {
                    if (!e.target.matches(`.${styles.assignmentStatus}, .${styles.assignmentStatus} *`)) {
                        setOpenedAssignment((o) => (o == thisUUID ? null : thisUUID));
                    }
                }}>
                <td className={styles.assignmentStatus} style={{ color: STATUS_COLORS[assignment.status], anchorName }}>
                    <button popoverTarget={popoverId} aria-label={`Change status for ${assignment.name}`} aria-controls={popoverId}>
                        {assignment.status}
                    </button>
                    <div
                        style={{
                            positionAnchor: anchorName
                        }}
                        id={popoverId}
                        popover="auto">
                        {Object.values(STATUSES).map((status) => (
                            <button
                                key={status}
                                aria-pressed={assignment.status === status}
                                style={{
                                    color: STATUS_COLORS[status],
                                    textDecoration: assignment.status == status ? "underline" : ""
                                }}
                                onClick={() => {
                                    updateAssignment(thisUUID, { status });
                                }}>
                                {status}
                            </button>
                        ))}
                    </div>
                </td>
                <td>{assignment.name}</td>
                <td>{assignment.type}</td>
                <td style={{ color: getDueDateMix(!isComplete && isOpen ? assignmentDate : Infinity) }}>
                    {isOpen ? "Due" : "Open"} {formatRelativeTime(assignmentDate)}
                </td>
                <td style={{ color: classes[assignment.class].color }}>{classes[assignment.class].code}</td>
            </tr>
            <tr id={`${thisUUID}-details`} className={styles.assignmentInformation} open={open}>
                <td colSpan={5}>
                    {assignment.description}
                    <div>
                        <button
                            aria-label={`Edit ${assignment.name}`}
                            onClick={() =>
                                showModal(AssignmentForm, {
                                    onComplete: (data) => {
                                        updateAssignment(thisUUID, data);
                                        closeModal();
                                    },
                                    currentData: assignment
                                })
                            }>
                            Edit
                        </button>
                        <button
                            aria-label={`Delete ${assignment.name}`}
                            onClick={() => {
                                deleteAssignment(thisUUID);
                            }}>
                            Delete
                        </button>
                    </div>
                </td>
            </tr>
        </>
    );
}
