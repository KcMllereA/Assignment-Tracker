import { useCallback, useState } from "react";
import { useAcademic } from "../../contexts/AcademicContext";

// TODO: pull this from semesters/index.json
const SEMESTERS = {
    269: "Fall 2026",
    272: "Spring 2027",
    276: "Summer 2027"
};

export default function ClassForm({ onComplete }) {
    const {
        actions: { addClass }
    } = useAcademic();

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [uniqueId, setUniqueId] = useState("");
    const [assignmentTypes, setAssignmentTypes] = useState([]);
    const [semester, setSemester] = useState("");

    const createClass = useCallback(
        (e) => {
            e.preventDefault();
            addClass({
                name,
                code,
                uniqueId,
                assignmentTypes: assignmentTypes.filter((assignmentType) => assignmentType.trim()),
                color: "#" + Math.random().toString(16).slice(2, 8),
                semester
            });
            onComplete();
        },
        [addClass, onComplete, name, code, uniqueId, assignmentTypes, semester]
    );
    return (
        <form aria-label="Class" onSubmit={createClass}>
            <input aria-label="Unique ID" placeholder="Unique ID" value={uniqueId} onChange={(e) => setUniqueId(e.target.value.replace(/\D+/g, ""))} />
            <input aria-label="Course name" placeholder="Course Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input aria-label="Course code" placeholder="Course Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <fieldset>
                <legend>Assignment Types</legend>
                {assignmentTypes.map((assignmentType, index) => (
                    <input
                        key={index}
                        aria-label={`Assignment type ${index + 1}`}
                        placeholder={`Assignment Type ${index + 1}`}
                        value={assignmentType}
                        onChange={(e) => setAssignmentTypes((currentTypes) => currentTypes.map((currentType, currentIndex) => (currentIndex === index ? e.target.value : currentType)))}
                    />
                ))}
                <button type="button" onClick={() => setAssignmentTypes((currentTypes) => [...currentTypes, ""])}>
                    Add Assignment Type
                </button>
            </fieldset>
            <select aria-label="Semester" value={semester} onChange={(e) => setSemester(e.target.value)} required>
                <option value="" disabled>
                    Select a Semester
                </option>
                {Object.keys(SEMESTERS).map((semesterId) => (
                    <option key={semesterId} value={semesterId}>
                        {SEMESTERS[semesterId]}
                    </option>
                ))}
            </select>
            <button type="submit">Create Course</button>
        </form>
    );
}
