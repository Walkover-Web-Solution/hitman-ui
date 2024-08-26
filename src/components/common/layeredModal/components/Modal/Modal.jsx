import React, { useEffect, useState } from 'react';
import "./Modal.css"

const Modal = ({ children, zIndex, top, left, show }) => {

    const [enableShow, setEnableShow] = useState(false)

    useEffect(() => {
        if (show) {
            setTimeout(() => {
                setEnableShow(true)
            }, 200)
        }
    }, [show])

    return (
        <div className={`__modal__ ${enableShow && show ? '__show__' : ''}`} style={{ zIndex, top, left }}>
            {children}
        </div>
    );
};

export default Modal;