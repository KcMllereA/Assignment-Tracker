import { useState } from "react";
import { useAcademic } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import ClassForm from "./ClassForm";

export default function Classes() {
    const {
        academicData: { classes }
    } = useAcademic();

    const [addingClass, setAddingClass] = useState(false);

    debugging.log("obtained classes:", classes);
    return (
        <>
            <h1>Classes</h1>
            <ul>
                {Object.keys(classes).map((course, i) => (
                    <li key={i}>{JSON.stringify(classes[course])}</li>
                ))}
            </ul>
            <button onClick={() => setAddingClass(true)}>Add class</button>
            {addingClass && (
                <>
                    <div aria-hidden="true" onClick={() => setAddingClass(false)}>close</div>
                    <ClassForm onComplete={() => setAddingClass(false)}></ClassForm>
                </>
            )}
        </>
    );
}
