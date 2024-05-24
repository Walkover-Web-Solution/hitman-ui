// created a generic modalFile for all modals
import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import InputGroup from 'react-bootstrap/InputGroup'
import './main.scss'
import { useState } from 'react'
import Form from 'react-bootstrap/Form'
function GenericModal({
  email,
  name,
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
    setName('')
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
                  placeholder='Enter User Name'
                  type='name'
                  aria-label="Recipient's name"
                  aria-describedby='basic-addon2'
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyPress}
                />
              </InputGroup>
              <InputGroup>
                <Form.Control
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
        {/* for create organization */}
          {showInput && (
        <Modal.Footer>
            <>
              <div className='m-2 d-grid gap-2 col-6 mx-auto create-org'>
                {/* <div className='d-flex justify-content-center'> */}
                {!createOrg && (
                  <Button className='' variant='btn btn-outline' onClick={handleClick}>
                    {' '}
                    + Create Organization
                  </Button>
                )}
              </div>
              {createOrg && (
                <>
                  <InputGroup className='mb-3'>
                    <Form.Control
                      placeholder='Enter Organization Name'
                      type='text'
                      aria-label='Organization name'
                      aria-describedby='basic-addon2'
                      value={orgName}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => {
                        handleKeyPress(e)
                      }}
                      isInvalid={orgName && !validateName(orgName)}
                    />
                    <Button onClick={handleAddOrg} variant='outline-secondary' id='button-addon2'>
                      Create
                    </Button>
                  </InputGroup>
                  <div className='d-flex'>
                    <small className='muted-text'>**Organization name accepts min 3 and max 50 characters</small>
                  </div>
                </>
              )}
            </>
        </Modal.Footer>
          )}
      </Modal>
    </div>
  )
}

export default GenericModal