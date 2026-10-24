import { useCallback, useState } from "react";
import { useAcademic } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import { dateToInputString } from "../../util/time";
import { Dropdown } from "../../components/Dropdown";

import styles from "./Assignments.module.css";
import { useModal } from "../../contexts/ModalContext";

export default function AssignmentForm({ onComplete, currentData = {} }) {
    const {
        academicData: { classes },
        actions: { addAssignment }
    } = useAcademic();

    const [classId, setClassId] = useState(currentData.class ?? "");
    const [type, setType] = useState(currentData.type ?? "");
    const [name, setName] = useState(currentData.name ?? "");
    const [description, setDescription] = useState(currentData.description ?? "");
    const [dueDate, setDueDate] = useState(currentData.dueDate ? dateToInputString(currentData.dueDate) : "");
    const [openDate, setOpenDate] = useState(dateToInputString(currentData.openDate ? currentData.openDate : new Date()));

    const [_, closeModal] = useModal();

    const createAssignment = useCallback(
        (e) => {
            e.preventDefault();
            onComplete({
                class: classId,
                type,
                name,
                description,
                dueDate: new Date(dueDate),
                openDate: openDate ? new Date(openDate) : null
            });
            debugging.log("submitted create assignment form");
        },
        [addAssignment, onComplete, classId, type, name, description, dueDate, openDate]
    );
    return (
        <form className={styles.assignmentForm} onSubmit={createAssignment}>
            <Dropdown
                id={styles.assignmentClass}
                label="Select a class"
                keys={Object.keys(classes)}
                values={Object.values(classes).map((assignmentClass) => assignmentClass.name)}
                value={classId}
                onChange={(e) => {
                    setClassId(e.target.value);
                    setType("");
                }}
                required
            />
            <Dropdown
                id={styles.assignmentType}
                label={classId ? "Select an assignment type" : "Select a class first"}
                keys={classes[classId]?.assignmentTypes ?? []}
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={!classId}
                required
            />
            <input id={styles.assignmentName} placeholder="Assignment Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <textarea id={styles.assignmentDescription} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input id={styles.assignmentOpenDate} type="datetime-local" aria-label="Open date" value={openDate} onChange={(e) => setOpenDate(e.target.value)} />
            <input id={styles.assignmentDueDate} type="datetime-local" aria-label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            <button type="button" id={styles.assignmentCancel} onClick={closeModal}>
                Cancel
            </button>
            <button type="submit">Save Assignment</button>
        </form>
    );
}
