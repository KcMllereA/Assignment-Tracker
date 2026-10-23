import { createContext, useCallback, useContext, useRef, useState } from "react";

import styles from "./Modal.module.css";

const ModalContext = createContext();

export function useModal() {
    return useContext(ModalContext);
}

export function ModalProvider({ children }) {
    const [show, setShow] = useState(false);
    const modalElement = useRef(null);
    const showModal = useCallback((component) => {
        modalElement.current = component;
        setShow(true);
    }, []);
    const closeModal = useCallback(() => {
        modalElement.current = null;
        setShow(false);
    }, []);
    return (
        <ModalContext value={[showModal, closeModal]}>
            {show && (
                <>
                    <div className={styles.backdrop} aria-hidden="true" onClick={() => setShow(false)} />
                    <dialog open className={styles.content}>
                        {modalElement.current}
                    </dialog>
                </>
            )}
            {children}
        </ModalContext>
    );
}
