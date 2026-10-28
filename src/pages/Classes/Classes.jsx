import { useEffect } from "react";
import { useAcademicStore } from "../../contexts/AcademicContext";
import debugging from "../../util/debug";
import ClassForm from "./ClassForm";
import { useModal } from "../../contexts/ModalContext";

export default function Classes() {
    const classes = useAcademicStore((x) => x?.classes);

    const { showModal, closeModal } = useModal();

    useEffect(() => {
        debugging.log("obtained classes:", classes);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return (
        <>
            <h1>Classes</h1>
            <ul>
                {Object.keys(classes).map((course, i) => (
                    <li key={i}>{JSON.stringify(classes[course])}</li>
                ))}
            </ul>
            <button onClick={() => showModal(ClassForm, { onComplete: closeModal })}>Add class</button>
        </>
    );
}
