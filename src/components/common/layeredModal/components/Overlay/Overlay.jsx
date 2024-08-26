import React from "react";
import { useModal } from "../../context/ModalContext";
import "./Overlay.css"
const Overlay = () => {
    const { closeModal, modalStack } = useModal();
    console.log("overlay : ", modalStack.length * 2000 - 10)
    return (
        <div
            className="__overlay__"
            style={{ zIndex: modalStack.length * 2000 - 10 }}
            onClick={closeModal}
        />
    );
};

export default Overlay