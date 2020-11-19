import React from 'react';
import { Modal } from "react-bootstrap";


function LoginSignupModal(props) {
    return (
        <Modal
            {...props}
            id="modal-open-api"
            size="lg"
            animation={false}
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Body>
                Modal
            </Modal.Body>
        </Modal>
    )
}

export default LoginSignupModal