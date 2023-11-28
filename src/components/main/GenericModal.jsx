// created a generic modalFile for all modals
import React from "react";
import { Modal, Button } from "react-bootstrap";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import "./main.scss";
function GenericModal({
  email,
  validateEmail,
  keyboard,
  loading,
  centered,
  showInputGroup,
  modalBody,
  handleKeyPress,
  inputRef,
  setEmail,
  handleSendInvite,
  handleCloseModal,
  showModal,
  title,
}) {
  return (
    <div>
      <Modal
        show={showModal}
        onHide={handleCloseModal}
        aria-labelledby="contained-modal-title-vcenter"
        centered={centered}
        keyboard={keyboard}
      >
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showInputGroup && (
            <>
              <InputGroup className="mb-3">
                <Form.Control
                  ref={inputRef}
                  placeholder="Enter User Email"
                  type="email"
                  aria-label="Recipient's email"
                  aria-describedby="basic-addon2"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyPress={handleKeyPress}
                  isInvalid={email && !validateEmail(email)}
                />
              </InputGroup>
              {/* show loading in invite org */}
              {loading ? (
                <div
                  class="spinner-border spinner-border-sm text-success p-2"
                  role="status"
                >
                  <span class="sr-only">Please Wait...</span>
                </div>
              ) : (
                <button
                  className="btn btn-primary"
                  type="submit"
                  onClick={handleSendInvite}
                >
                  Send
                </button>
              )}
            </>
          )}
          {modalBody}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default GenericModal;
