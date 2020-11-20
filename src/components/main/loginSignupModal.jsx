import React from 'react';
import { Modal } from "react-bootstrap";
import { Button } from 'react-bootstrap';

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
                {props.title === "Save Endpoint" ? (
                    <div>
                        <div>Seems you have not Registered with us.</div>
                        <Button variant="warning">Login/Signup</Button>
                    </div>
                ) : (<div>
                    <div>Seems you are not logged in.</div>
                    <div>Kindly login or signup to save collection in your account</div>
                    <Button variant="warning">Login/Signup</Button>
                </div>)}
            </Modal.Body>
        </Modal >
    )
}

export default LoginSignupModal