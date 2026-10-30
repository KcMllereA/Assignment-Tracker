import { useCallback, useMemo, useRef, useState } from "react";
import { useAcademicStore } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import { dateToInputString } from "../../util/time";
import Dropdown from "../../components/Dropdown";
import DateTimeInput from "../../components/DateTimeInput";

import styles from "./Assignments.module.css";
import { useModal } from "../../contexts/ModalContext";
import InputLabel from "../../components/InputLabel";

const EMPTY_ARRAY = [];

export default function AssignmentForm({ onComplete, currentData, title="Assignment" }) {
    const classes = useAcademicStore((x) => x?.classes);
    const [classIds, classNames] = useMemo(() => {
        let ids = Object.keys(classes);
        return [ids, ids.map((x) => classes[x].name)];
    }, [classes]);

    const [classId, setClassId] = useState(currentData?.class ?? "");
    const [type, setType] = useState(currentData?.type ?? "");
    const [dueDate, setDueDate] = useState(currentData?.dueDate ? dateToInputString(currentData?.dueDate) : "");
    const [openDate, setOpenDate] = useState(dateToInputString(currentData?.openDate ? currentData?.openDate : new Date()));

    const nameRef = useRef();
    const descRef = useRef();

    const { closeModal } = useModal();

    const createAssignment = useCallback(
        (e) => {
            e.preventDefault();
            closeModal();
            onComplete({
                class: classId,
                type,
                name: nameRef.current?.value,
                description: descRef.current?.value,
                dueDate: new Date(dueDate),
                openDate: openDate ? new Date(openDate) : null
            });
            debugging.log("submitted create assignment form");
        },
        [onComplete, classId, type, dueDate, openDate, closeModal]
    );
    const chooseClass = useCallback((e) => {
        setClassId(e.target.value);
        setType("");
    }, []);
    const chooseType = useCallback((e) => setType(e.target.value), []);
    return (
        <form className={styles.assignmentForm} aria-label="Assignment" onSubmit={createAssignment}>
            <h2>{title}</h2>
            <div className={styles.assignmentName}>
                <InputLabel htmlFor="assignmentName" required label="Name" />
                <input defaultValue={currentData?.name ?? ""} ref={nameRef} id="assignmentName" aria-label="Assignment name" placeholder="Assignment Name" required />
            </div>
            <div className={styles.assignmentDescription}>
                <InputLabel htmlFor="assignmentDesc" label="Description" />
                <textarea defaultValue={currentData?.description ?? ""} ref={descRef} id="assignmentDesc" aria-label="Description" placeholder="Description" />
            </div>
            <Dropdown id={styles.assignmentClass} label="Class" placeholder="Select a class" keys={classIds} values={classNames} value={classId} onChange={chooseClass} required />
            <Dropdown
                id={styles.assignmentType}
                label="Assignment Type"
                placeholder={classId ? "Select an assignment type" : "Select a class first"}
                keys={classes[classId]?.assignmentTypes ?? EMPTY_ARRAY}
                value={type}
                onChange={chooseType}
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
