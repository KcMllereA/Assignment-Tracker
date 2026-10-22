import { useCallback, useState } from "react";
import { useAcademic } from "../../contexts/AcademicContext";

export default function ClassForm({ onComplete }) {
    /* 
    Must get the following data from the user:
    class name
    class code
    unique number
    semester?
    color?
    credits?
    gradeType?
    dropped?
    lecture?
        startDate
        endDate
        meetingTimes
    
    */
    const {
        actions: { addClass }
    } = useAcademic();

    const [name, setName] = useState("");
    const [code, setCode] = useState("");
    const [uniqueId, setUniqueId] = useState("");
    const [assignmentTypes, setAssignmentTypes] = useState([]);
    // const [semester, setSemester] = useState("");

    const createClass = useCallback(
        (e) => {
            e.preventDefault();
            addClass({
                name,
                code,
                uniqueId,
                assignmentTypes: assignmentTypes.filter((assignmentType) => assignmentType.trim()),
                color: "#" + Math.random().toString(16).slice(2, 8)
            });
            onComplete();
        },
        [addClass, onComplete, name, code, uniqueId, assignmentTypes]
    );
    return (
        <form onSubmit={createClass}>
            <input placeholder="Unique ID" value={uniqueId} onChange={(e) => setUniqueId(e.target.value.replace(/\D+/g, ""))} />
            <input placeholder="Course Name" value={name} onChange={(e) => setName(e.target.value)} />
            <input placeholder="Course Code" value={code} onChange={(e) => setCode(e.target.value)} />
            <fieldset>
                <legend>Assignment Types</legend>
                {assignmentTypes.map((assignmentType, index) => (
                    <input
                        key={index}
                        placeholder={`Assignment Type ${index + 1}`}
                        value={assignmentType}
                        onChange={(e) =>
                            setAssignmentTypes((currentTypes) =>
                                currentTypes.map((currentType, currentIndex) =>
                                    currentIndex === index ? e.target.value : currentType
                                )
                            )
                        }
                    />
                ))}
                <button
                    type="button"
                    onClick={() => setAssignmentTypes((currentTypes) => [...currentTypes, ""])}
                >
                    Add Assignment Type
                </button>
            </fieldset>
            <button type="submit">Create Course</button>
        </form>
    );
}
