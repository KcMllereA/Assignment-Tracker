import { useCallback, useState } from "react";
import { useAcademic } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import { dateToInputString } from "../../util/time";
import { Dropdown } from "../../components/Dropdown";
import DateTimeInput from "../../components/DateTimeInput";

import styles from "./Assignments.module.css";
import { useModal } from "../../contexts/ModalContext";

export default function AssignmentForm({ onComplete, currentData }) {
    const {
        academicData: { classes }
    } = useAcademic();

    const [classId, setClassId] = useState(currentData?.class ?? "");
    const [type, setType] = useState(currentData?.type ?? "");
    const [name, setName] = useState(currentData?.name ?? "");
    const [description, setDescription] = useState(currentData?.description ?? "");
    const [dueDate, setDueDate] = useState(currentData?.dueDate ? dateToInputString(currentData?.dueDate) : "");
    const [openDate, setOpenDate] = useState(dateToInputString(currentData?.openDate ? currentData?.openDate : new Date()));

    const { closeModal } = useModal();

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
        [onComplete, classId, type, name, description, dueDate, openDate]
    );
    return (
        <form className={styles.assignmentForm} aria-label="Assignment" onSubmit={createAssignment}>
            <input id={styles.assignmentName} aria-label="Assignment name" placeholder="Assignment Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <textarea id={styles.assignmentDescription} aria-label="Description" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <Dropdown
                id={styles.assignmentClass}
                label="Class"
                placeholder="Select a class"
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
                label="Assignment Type"
                placeholder={classId ? "Select an assignment type" : "Select a class first"}
                keys={classes[classId]?.assignmentTypes ?? []}
                value={type}
                onChange={(e) => setType(e.target.value)}
                disabled={!classId}
                required
            />
            <DateTimeInput id={styles.assignmentOpenDate} label="Open date" value={openDate} onChange={setOpenDate} />
            <DateTimeInput id={styles.assignmentDueDate} label="Due date" value={dueDate} onChange={setDueDate} required />
            <button type="button" id={styles.assignmentCancel} onClick={closeModal}>
                Cancel
            </button>
            <button type="submit">Save Assignment</button>
        </form>
    );
}
