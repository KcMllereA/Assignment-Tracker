import { useAcademicStore } from "../../contexts/AcademicContext";
import { downloadJSON } from "../../util/download";

export default function Settings() {
    // eslint-disable-next-line no-unused-vars
    const { groupedAssignments: _, ...academicData } = useAcademicStore(s => s);
    return (
        <>
            <h1>Settings</h1>

            <button
                onClick={() => {
                    downloadJSON(academicData, "user-data");
                }}>
                Export Data
            </button>
        </>
    );
}
