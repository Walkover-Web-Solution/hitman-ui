import React from 'react'
import { Modal, Button } from 'react-bootstrap'
import Input from './input'

const InputModal = ({ props, show, onHide, onChange, onSave, Save, data, name1, label, mandatory, note }) => {
  return (
    <Modal size='sm' animation={false} aria-labelledby='contained-modal-title-vcenter' centered show={show} onHide={onHide}>
      <Modal.Header className='custom-collection-modal-container' closeButton>
        <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className='mb-3'>
          <Input
            type='text'
            id='name'
            name={name1}
            label={label}
            mandatory={mandatory}
            note={note}
            className='form-control'
            value={data.name}
            onChange={onChange}
          />
        </div>
        <button className='btn btn-primary btn-sm fs-4' onClick={onSave}>
          {Save}
        </button>
      </Modal.Body>
    </Modal>
  )
}

export default InputModal
