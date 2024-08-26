import React, { createContext, useContext, useState } from 'react';
import { calculatePosition, createTempDiv } from '../utils/Utility';
import Modal from '../components/Modal/Modal';
import Overlay from '../components/Overlay/Overlay';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalStack, setModalStack] = useState([]);

    const openModal = async (e, content, customPosition) => {
        const buttonRect = e.target.getBoundingClientRect();
        const tempDiv = createTempDiv();
        document.body.appendChild(tempDiv);
        // const root = createRoot(tempDiv);

        // Render the content directly instead of wrapping it in a new ModalProvider
        // root.render(content); // Pass the content directly

        // const resizeObserver = new ResizeObserver((entries) => {
        //     const entry = entries[0];
        //     const { width, height } = entry.contentRect;
        //     const position = calculatePosition(buttonRect, { width, height }, customPosition);
        //     setModalStack((prev) => [
        //         ...prev,
        //         { content, position, zIndex: (prev.length + 1) * 2000, show: true }
        //     ]);
        //     root.unmount();
        //     document.body.removeChild(tempDiv);
        //     resizeObserver.disconnect();
        // });
        // resizeObserver.observe(tempDiv);

        let position = { top: 100, left: 300 };

        setModalStack((prev) => [
            ...prev,
            { content, position, zIndex: (prev.length + 1) * 2000, show: true }
        ]);
    };

    const closeModal = () => {
        // Change the show property of the last modal to false
        setModalStack((prev) => {
            const updatedStack = [...prev];
            if (updatedStack.length > 0) {
                updatedStack[updatedStack.length - 1].show = false;
            }
            return updatedStack;
        });

        // After 100 ms, pop the last modal from the stack
        setTimeout(() => {
            setModalStack((prev) => prev.slice(0, -1));
        }, 100);
    };

    const topModalIndex = modalStack.length - 1;

    return (
        <ModalContext.Provider value={{ modalStack, openModal, closeModal, topModalIndex }}>
            {children}
            {modalStack.length > 0 && <Overlay zIndex={(topModalIndex + 1) * 2000 - 10} />}
            {
                modalStack.map((modal, index) => {
                    return (
                        <Modal show={modal.show} zIndex={(index + 1) * 2000} top={modal.position.top} left={modal.position.left} key={index}>
                            {modal.content}
                        </Modal>
                    )
                })
            }
        </ModalContext.Provider>
    );
};