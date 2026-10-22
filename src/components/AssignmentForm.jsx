import { useCallback, useState } from "react";
import { useAcademic } from "../contexts/AcademicContext";
import debugging from "../util/debug";
import { STATUSES } from "../logic/assignments";

export default function AssignmentForm({ onComplete }) {
    const {
        academicData: { classes },
        actions: { addAssignment }
    } = useAcademic();

    const [assignmentClass, setAssignmentClass] = useState("");
    const [type, setType] = useState("");
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [dueDate, setDueDate] = useState("");

    const createAssignment = useCallback(
        (e) => {
            e.preventDefault();
            addAssignment({
                class: assignmentClass,
                type,
                name,
                description,
                dueDate: new Date(dueDate).getTime(),
                status: STATUSES.NOT_STARTED
            });
            debugging.log("submitted create assignment form");
            onComplete();
        },
        [addAssignment, onComplete, assignmentClass, type, name, description, dueDate]
    );
    return (
        <form onSubmit={createAssignment}>
            <select
                aria-label="Class"
                value={assignmentClass}
                onChange={(e) => {
                    setAssignmentClass(e.target.value);
                    setType("");
                }}
                required>
                <option value="" disabled>
                    Select a class
                </option>
                {Object.entries(classes).map(([uniqueId, course]) => (
                    <option key={uniqueId} value={uniqueId}>
                        {course.name}
                    </option>
                ))}
            </select>
            <select aria-label="Assignment type" value={type} onChange={(e) => setType(e.target.value)} disabled={!assignmentClass} required>
                <option value="" disabled>
                    {assignmentClass ? "Select an assignment type" : "Select a class first"}
                </option>
                {(classes[assignmentClass]?.assignmentTypes ?? []).map((assignmentType) => (
                    <option key={assignmentType} value={assignmentType}>
                        {assignmentType}
                    </option>
                ))}
            </select>
            <input placeholder="Assignment Name" value={name} onChange={(e) => setName(e.target.value)} required />
            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <input type="datetime-local" aria-label="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
            <button type="submit">Create Assignment</button>
        </form>
    );
}
