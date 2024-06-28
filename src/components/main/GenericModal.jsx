import React, { useState } from 'react'
import { Modal, Button, InputGroup, Form } from 'react-bootstrap'
import './main.scss'

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
  const [createOrg, setCreateOrg] = useState(false)

  const handleClick = () => {
    setCreateOrg(!createOrg)
  }

  const handleClose = () => {
    handleCloseModal()
    setCreateOrg(false)
  }

  return (
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
            {loading ? (
              <div className='spinner-border spinner-border-sm text-success p-2' role='status'>
                <span className='sr-only'>Please Wait...</span>
              </div>
            ) : (
              <Button className='btn-primary btn-sm mt-2 fs-4' onClick={handleSendInvite}>
                Send
              </Button>
            )}
          </>
        )}
        {modalBody}
      </Modal.Body>
      {showInput && (
        <Modal.Footer>
          <div className='m-2 d-grid gap-2 col-6 mx-auto'>
            {!createOrg ? (
              <Button variant='outline-primary' onClick={handleClick}>
                + Create Organization
              </Button>
            ) : (
              <>
                <InputGroup className='mb-3'>
                  <Form.Control
                    placeholder='Enter Organization Name'
                    type='text'
                    aria-label='Organization name'
                    aria-describedby='basic-addon2'
                    value={orgName}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyPress}
                    isInvalid={orgName && !validateName(orgName)}
                  />
                  <Button onClick={handleAddOrg} variant='outline-secondary'>
                    Create
                  </Button>
                </InputGroup>
                <div className='d-flex'>
                  <small className='text-muted'>**Organization name accepts min 3 and max 50 characters</small>
                </div>
              </>
            )}
          </div>
        </Modal.Footer>
      )}
    </Modal>
  )
}

export default GenericModal
