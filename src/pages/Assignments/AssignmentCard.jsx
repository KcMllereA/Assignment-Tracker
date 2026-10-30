import useNow from "../../hooks/useNow";
import { formatRelativeTime } from "../../util/time";
import { useAcademicStore, useAcademicActions } from "../../contexts/AcademicContext";
import AssignmentForm from "./AssignmentForm";
import { useModal } from "../../contexts/ModalContext";
import { getDueDateMix, SECTIONS, STATUS_COLORS, STATUSES } from "../../logic/assignments";
import { useAssignmentDetails } from "../../hooks/stores";

import styles from "./Assignments.module.css";
import { memo, useCallback, useId } from "react";

const AssignmentTime = memo(function AssignmentTime({ isComplete, isOpen, assignmentDate }) {
    const now = useNow();
    const timestamp = assignmentDate - now;
    return (
        <td style={{ color: getDueDateMix(!isComplete && isOpen ? timestamp : Infinity) }}>
            {isOpen ? "Due" : "Open"} {formatRelativeTime(timestamp)}
        </td>
    );
});

export default memo(function AssignmentCard({ uuid, group: section }) {
    const popoverId = useId();
    const anchorName = "--" + popoverId;
    const assignment = useAcademicStore((x) => x?.assignments[uuid]);
    const thisUUID = assignment.uuid;

    const isOpen = section != SECTIONS.NOT_OPEN;
    const isComplete = section == SECTIONS.COMPLETE;
    const assignmentDate = isOpen ? assignment.dueDate : assignment.openDate;

    const { updateAssignment, deleteAssignment } = useAcademicActions();
    const classes = useAcademicStore((x) => x?.classes);
    const { showModal } = useModal();

    const [open, setOpenedAssignment] = useAssignmentDetails((opened) => opened == thisUUID);

    const editAssignment = useCallback(() => {
        showModal(AssignmentForm, {
            onComplete: updateAssignment.bind(null, assignment.uuid),
            currentData: assignment,
            title: "Edit Assignment"
        });
    }, [showModal, assignment, updateAssignment]);

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
                <AssignmentTime isComplete={isComplete} isOpen={isOpen} assignmentDate={assignmentDate} />
                <td style={{ color: classes[assignment.class].color }}>{classes[assignment.class].code}</td>
            </tr>
            <tr id={`${thisUUID}-details`} className={styles.assignmentInformation} open={open}>
                <td colSpan={5}>
                    {assignment.description}
                    <div>
                        <button aria-label={`Edit ${assignment.name}`} onClick={editAssignment}>
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
});
