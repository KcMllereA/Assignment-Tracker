import { useCallback, useState } from "react";
import { ModalContext } from "./ModalContext";

import styles from "./Modal.module.css";

const EMPTY_CONFIG = { Component: null, props: {} };

export function ModalProvider({ children }) {
    const [modalConfig, setModalConfig] = useState(EMPTY_CONFIG);

    const showModal = useCallback((Component, props = {}) => {
        setModalConfig({ Component, props });
    }, []);
    const closeModal = useCallback(() => {
        setModalConfig(EMPTY_CONFIG);
    }, []);
    return (
        <ModalContext value={{showModal, closeModal}}>
            {modalConfig.Component && (
                <>
                    <div className={styles.backdrop} aria-hidden="true" onClick={closeModal} />
                    <dialog open className={styles.content} aria-label="Form dialog">
                        <modalConfig.Component {...modalConfig.props} />
                    </dialog>
                </>
            )}
            {children}
        </ModalContext>
    );
}
