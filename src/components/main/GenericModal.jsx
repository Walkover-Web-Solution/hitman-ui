// created a generic modalFile for all modals
import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import InputGroup from 'react-bootstrap/InputGroup'
import './main.scss'
import { useState } from 'react'
import Form from 'react-bootstrap/Form'
function GenericModal({
  email,
  validateEmail,
  validateName,
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
}) {
  const [createOrg, setcreateOrg] = useState(false)
  const handleClick = () => {
    setcreateOrg(!createOrg)
  }
  const handleClose = () => {
    handleCloseModal()
    setcreateOrg(false)
  }
  return (
    <div>
      <Modal show={showModal} onHide={handleClose} aria-labelledby='contained-modal-title-vcenter' centered={centered} keyboard={keyboard}>
        <Modal.Header closeButton>
          <Modal.Title>{title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {showInputGroup && (
            <>
              <InputGroup className='mb-2'>
                <Form.Control
                 ref={inputRef}
                  placeholder='Enter User Email'
                  type='email'
                  aria-label="Recipient's email"
                  aria-describedby='basic-addon2'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={handleKeyPress}
                  isInvalid={email && !validateEmail(email)}
                />
              </InputGroup>

              {/* show loading in invite org */}
             
              {loading ? (
                      <div class='spinner-border spinner-border-sm text-success p-2' role='status'>
                        <span class='sr-only'>Please Wait...</span>
                      </div>
                    ) : (
                      <button className='btn btn-primary btn-sm mt-2 fs-4' type='submit' onClick={handleSendInvite}>
                        Send
                      </button>
                    )}
            </>
          )}
          {modalBody}
        </Modal.Body>
        
      </Modal>
    </div>
  )
}

export default GenericModal