import { useCallback, useState } from "react";
import { useAcademic } from "../contexts/AcademicContext";
import debugging from "../util/debug";
import { STATUSES } from "../logic/assignments";
import { dateToInputString } from "../util/time";

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
        <form onSubmit={createAssignment}>
            <select
                aria-label="Class"
                value={classId}
                onChange={(e) => {
                    setClassId(e.target.value);
                    setType("");
                }}
                required>
                <option value="" disabled>
                    Select a class
                </option>
                {Object.keys(classes).map((uniqueId) => (
                    <option key={uniqueId} value={uniqueId}>
                        {classes[uniqueId].name}
                    </option>
                ))}
            </select>
            <select aria-label="Assignment type" value={type} onChange={(e) => setType(e.target.value)} disabled={!classId} required>
                <option value="" disabled>
                    {classId ? "Select an assignment type" : "Select a class first"}
                </option>
                {(classes[classId]?.assignmentTypes ?? []).map((assignmentType) => (
                    <option key={assignmentType} value={assignmentType}>
                        {assignmentType}
                    </option>
                ))}
            </select>
            <input placeholder="Assignment Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="datetime-local" aria-label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            <input type="datetime-local" aria-label="Open date" value={openDate} onChange={(e) => setOpenDate(e.target.value)} />
            <button type="submit">Create Assignment</button>
        </form>
    );
}
