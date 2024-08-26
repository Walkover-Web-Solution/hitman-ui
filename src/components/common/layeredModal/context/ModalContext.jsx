import React, { createContext, useContext, useState } from 'react';
import { calculatePosition, createTempDiv } from '../utils/Utility';
import Overlay from '../components/Overlay/Overlay';
import { createRoot } from 'react-dom/client';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalStack, setModalStack] = useState([]);

    console.log("modals : ", modalStack)


    const openModal = async (e, content, modalName, customPosition) => {
        const buttonRect = e.target.getBoundingClientRect();
        const tempDiv = createTempDiv();
        document.body.appendChild(tempDiv);
        const root = createRoot(tempDiv);

        root.render(content);

        const resizeObserver = new ResizeObserver((entries) => {
            const entry = entries[0];
            const { width, height } = entry.contentRect;
            const position = calculatePosition(buttonRect, { width, height }, customPosition);
            setModalStack((prev) => [
                ...prev,
                { position, zIndex: (prev.length + 1) * 2000, modalName }
            ]);

            root.unmount();
            document.body.removeChild(tempDiv);
            resizeObserver.disconnect();
        });
        resizeObserver.observe(tempDiv);
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
        </ModalContext.Provider>
    );
};