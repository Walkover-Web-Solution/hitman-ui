import React from 'react';
import { Modal } from "react-bootstrap";
import { Button } from 'react-bootstrap';
import loginIcon from "../../assets/icons/loginIcon.svg"

function LoginSignupModal(props) {
    const redirectionUrl = process.env.REACT_APP_UI_URL + "/login";
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
                <div>
                    {props.title === "Save Endpoint" ? (
                        <div>
                            <img src={loginIcon}></img>
                            <div>Seems you have not Registered with us.</div>
                        </div>
                    ) : (<div>
                        <div>Seems you are not logged in.</div>
                        <div>Kindly login or signup to save collection in your account</div>
                    </div>)}
                    <div
                        id="sokt-sso"
                        data-redirect-uri={redirectionUrl}
                        data-source="sokt-app"
                        data-token-key="sokt-auth-token"
                        data-view="button"
                    ></div>
                </div>
            </Modal.Body>
        </Modal >
    )
}

export default LoginSignupModal