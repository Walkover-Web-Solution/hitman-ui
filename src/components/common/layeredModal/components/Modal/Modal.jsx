import React, { useEffect, useState } from 'react';
import "./Modal.css"
import { useModal } from '../../context/ModalContext';
import { AiOutlineConsoleSql } from 'react-icons/ai';

const LayeredModal = ({ name, children }) => {

    const [enableShow, setEnableShow] = useState(false)
    const { modalStack, modalNames } = useModal();
    const [position, setPosition] = useState({ top: 0, left: 0 })

    const isModalOpened = modalStack.find((modal) => modal.modalName === name)

    useEffect(() => {
        if (isModalOpened) {
            setTimeout(() => {
                setEnableShow(true)
            }, 200)
        }
    }, [isModalOpened])

    useEffect(() => {
        if (isModalOpened) {
            const modal = modalStack.find((modal) => modal.modalName === name);
            setPosition({ top: modal.position.top, left: modal.position.left })
        }
    }, [isModalOpened])

    return (
        <div className={`__modal__ ${enableShow && isModalOpened ? '__show__' : ''}`} style={{ zIndex: isModalOpened?.zIndex, top: position.top, left: position.left }}>
            {children}
        </div>
    );
};

export default LayeredModal;