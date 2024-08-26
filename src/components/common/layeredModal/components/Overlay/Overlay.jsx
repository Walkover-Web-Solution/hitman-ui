import React from "react";
import { useModal } from "../../context/ModalContext";
import "./Overlay.css"
const Overlay = ({ zIndex }) => {
    const { closeModal } = useModal();
    return (
        <div
            className="__overlay__"
            style={{ zIndex }}
            onClick={closeModal}
        />
    );
};

export default Overlay