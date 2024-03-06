import React, { useState } from 'react'
import { Button, ListGroup, Modal } from 'react-bootstrap'
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icon.svg'
import { useSelector } from 'react-redux'
import { FiPlus } from 'react-icons/fi'
import environmentsService from '../../environments/environmentsService'
import './publicEnviromentModal.scss'

const PublicEnvironmentList = () => {
  const handleClick = () => {
    console.log('deleted')
  }

  return (
    <div className='mb-2 d-flex justify-content-between w-100'>
      <ListGroup.Item>Hello world</ListGroup.Item>
      <div className='d-flex align-items-center'>
        <Button className='m-1 p-1 make-default-btn' variant='btn btn-outline'>
          Make Default
        </Button>
        <DeleteIcon className='ml-1' onClick={handleClick} />
      </div>
    </div>
  )
}

const GlobalEnvironmentList = () => {
  const { environments } = useSelector((state) => {
    return {
      environments: state.environment.environments
    }
  })

  if (Object.keys(environments)?.length == 0) return <p>No existing Environment is present</p>

  return (
    <React.Fragment>
      {Object.keys(environments).map((singleEnvId) => {
        return (
          <div className='mb-2 d-flex justify-content-between w-100'>
            <ListGroup.Item>{environments?.[singleEnvId].name}</ListGroup.Item>
            <Button size='lg' className='m-1 p-1' variant='btn btn-outline'>
              Add
            </Button>
          </div>
        )
      })}
    </React.Fragment>
  )
}

export default function PublicEnviromentModal(props) {

  return (
    <Modal
      show={props?.openModal}
      // show={true}
      size='lg'
      animation={false}
      aria-labelledby='contained-modal-title-vcenter'
      centered
    >
      <Modal.Header className='custom-collection-modal-container d-flex align-items-center'>
        <Modal.Title id='contained-modal-title-vcenter'>Manage Public Environments</Modal.Title>
        <div onClick={()=> props.handleOpenNewModal()} className='d-flex align-items-center add-new-btn cursor-pointer'>
          <FiPlus />
          <span>Add New</span>
        </div>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          <PublicEnvironmentList />
        </ListGroup>
      </Modal.Body>
      <div className='ruler'></div>
      <p className='existing-env-heading pl-4 mt-3'>Add Existing Environments</p>
      <Modal.Body>
        <ListGroup>
          <GlobalEnvironmentList />
        </ListGroup>
        <div onClick={() => props?.handleCloseModal()} className='custom-button-wrapper text-right mt-5'>
          <button className='btn btn-secondary outline btn-lg'>Cancel</button>
        </div>
      </Modal.Body>
    </Modal>
  )
}
