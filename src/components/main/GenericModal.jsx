// created a generic modalFile for all modals
import React from "react";
import { Modal, Button } from "react-bootstrap";
import InputGroup from "react-bootstrap/InputGroup";
import "./main.scss";
import { useState, useEffect, useRef } from "react";
import Form from 'react-bootstrap/Form';
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
  showInput,
  handleAddOrg,
  setName,
  orgName
}) 
{
  const [createOrg, setcreateOrg] = useState(false)
  const handleClick = ()=>{
    console.log("handleClick ");
    setcreateOrg(!createOrg);
  }
  const handleCreate = ()=>{
    console.log("clicked", orgName);
  }
  const validateName = (orgName) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgName);
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
          {/* for create organization */}
        <Modal.Footer>
        {showInput && (
            <>
            <Button onClick={handleClick}>Create Organization</Button>
            {createOrg && <>

              <InputGroup className="mb-3">
        <Form.Control
          placeholder="Enter Organization Name"
          type="text"
          aria-label="Organization name"
          aria-describedby="basic-addon2"
          value={orgName}
          onChange={(e) => setName(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button onClick={handleAddOrg} variant="outline-secondary" id="button-addon2">
          Create
        </Button>
      </InputGroup>

              </>
              }
            </>
          )}
       </Modal.Footer>
      </Modal>
    </div>
  );
}

export default GenericModal;
