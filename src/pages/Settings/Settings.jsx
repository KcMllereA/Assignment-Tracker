import { useAcademic } from "../../contexts/AcademicContext";
import { downloadJSON } from "../../util/download";

export default function Settings() {
    const { academicData } = useAcademic();
    return (
        <>
            <h1>Settings</h1>

            <button onClick={() => {
                downloadJSON(academicData, "user-data");
            }}>Export Data</button>
        </>
    );
}
