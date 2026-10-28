import { useMemo, useState } from "react";
import { ModalContext } from "./ModalContext";

import styles from "./Modal.module.css";

const EMPTY_CONFIG = { Component: null, props: {} };

export function ModalProvider({ children }) {
    const [modalConfig, setModalConfig] = useState(EMPTY_CONFIG);

    const value = useMemo(
        () => ({
            showModal: (Component, props = {}) => {
                setModalConfig({ Component, props });
            },
            closeModal: () => {
                setModalConfig(EMPTY_CONFIG);
            }
        }),
        []
    );

    return (
        <ModalContext value={value}>
            {modalConfig.Component && (
                <>
                    <div className={styles.backdrop} aria-hidden="true" onClick={value.closeModal} />
                    <dialog open className={styles.content} aria-label="Form dialog">
                        <modalConfig.Component {...modalConfig.props} />
                    </dialog>
                </>
            )}
            {children}
        </ModalContext>
    );
}
