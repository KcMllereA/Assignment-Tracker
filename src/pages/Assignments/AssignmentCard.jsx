import useNow from "../../hooks/useNow";
import { formatRelativeTime } from "../../util/time";
import { useAcademic } from "../../contexts/AcademicContext";
import AssignmentForm from "./AssignmentForm";
import { useModal } from "../../contexts/ModalContext";
import { getDueDateMix, getSection, SECTIONS, STATUS_COLORS, STATUSES } from "../../logic/assignments";
import { useAssignmentDetails, useStatusSelector } from "../../hooks/stores";

import styles from "./Assignments.module.css";

export default function AssignmentCard({ assignment }) {
    const now = useNow();
    const {
        actions: { updateAssignment, deleteAssignment }
    } = useAcademic();
    const thisUUID = assignment.uuid;
    const [showModal, closeModal] = useModal();
    const section = getSection(assignment, Date.now());
    const isOpen = section != SECTIONS.NOT_OPEN;
    const isComplete = section == SECTIONS.COMPLETE;
    const assignmentDate = (isOpen ? assignment.dueDate : assignment.openDate) - now;

    const [selectedAssignment, setShowStatus] = useStatusSelector();

    const [openedAssignment, setOpenedAssignment] = useAssignmentDetails();

    const open = openedAssignment == thisUUID;
    const showStatus = selectedAssignment == thisUUID;

    // const [{ uuid: openedUUID, type: openedType }, setOpened] = useOpened();
    // const open = openedUUID == thisUUID && openedType == "information";
    // const showStatus = openedUUID == thisUUID && openedType == "status";
    return (
        <>
            <tr
                className={styles.assignmentCard}
                onClick={(e) => {
                    if (!e.target.matches(`.${styles.assignmentStatus}, .${styles.assignmentStatus} *`)) {
                        // setOpened(({ uuid, type }) => {
                        //     if (uuid == thisUUID && type == "information") {
                        //         return { uuid: null, type: null };
                        //     }
                        //     return { uuid: thisUUID, type: "information" };
                        // });

                        setOpenedAssignment((o) => (o == thisUUID ? null : thisUUID));
                    }
                }}>
                <td
                    className={styles.assignmentStatus}
                    style={{ color: STATUS_COLORS[assignment.status] }}
                    onClick={(e) => {
                        // setOpened(({ uuid, type }) => {
                        //     if (uuid == thisUUID && type == "status") {
                        //         return { uuid: null, type: null };
                        //     }
                        //     return { uuid: thisUUID, type: "status" };
                        // });
                        setShowStatus((s) => (s == thisUUID ? null : thisUUID));
                    }}>
                    {assignment.status}
                    {showStatus && (
                        <div>
                            {Object.values(STATUSES).map((status) => (
                                <button
                                    key={status}
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
                    )}
                </td>
                <td>{assignment.name}</td>
                <td>{assignment.type}</td>
                <td style={{ color: getDueDateMix(!isComplete && isOpen ? assignmentDate : Infinity) }}>
                    {isOpen ? "Due" : "Open"} {formatRelativeTime(assignmentDate)}
                </td>
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
                                            updateAssignment(thisUUID, data);
                                            closeModal();
                                        }}
                                        currentData={assignment}
                                    />
                                )
                            }>
                            Edit
                        </button>
                        <button
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
