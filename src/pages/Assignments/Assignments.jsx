import { useState } from "react";
import AssignmentForm from "../../components/AssignmentForm";
import { useAcademic } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import AssignmentCard from "./AssignmentCard";

export default function Assignments() {
    const {
        academicData: { assignments },
        groupedAssignments
    } = useAcademic();
    const [addingAssignment, setAddingAssignment] = useState(false);
    debugging.log("obtained assignments:", assignments, groupedAssignments);
    return (
        <>
            <h1>Assignments</h1>
            {Object.keys(groupedAssignments).map((group) => (
                <fieldset key={group}>
                    <legend>{group}</legend>
                    <ul>
                        {groupedAssignments[group].map((x, i) => (
                            <AssignmentCard key={i} assignment={x} />
                        ))}
                    </ul>
                </fieldset>
            ))}

            <button onClick={() => setAddingAssignment(true)}>Add assignment</button>
            {addingAssignment && (
                <>
                    <div aria-hidden="true" onClick={() => setAddingAssignment(false)}>
                        close
                    </div>
                    <AssignmentForm onComplete={() => setAddingAssignment(false)} />
                </>
            )}
        </>
    );
}
