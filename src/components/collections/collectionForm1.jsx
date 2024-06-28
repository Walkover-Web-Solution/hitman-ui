import React from 'react'
import { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { onEnter, validate } from '../common/utility'
import shortid from 'shortid'
import { connect } from 'react-redux'
import { addCollection, updateCollection } from './redux/collectionsActions'
import { moveToNextStep } from '../../services/widgetService'
import { defaultViewTypes } from './defaultViewModal/defaultViewModal1'
import Input from '../common/input'
import InputModal from '../common/CustomModal'

const mapStateToProps = (state) => {
  return {
    collections: state.collections
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    add_collection: (newCollection, openSelectedCollection, callback) =>
      dispatch(addCollection(newCollection, openSelectedCollection, callback)),
    update_collection: (editedCollection, setLoader, callback) => dispatch(updateCollection(editedCollection, setLoader, callback))
  }
}

const CollectionForm = (props) => {
  const [data, setData] = useState({
    name: '',
    description: '',
    defaultView: defaultViewTypes.TESTING
  })
  const [collectionId, setCollectionId] = useState('')
  const [errors, setErrors] = useState({})
  const [show, setShow] = useState(true)
  const [step, setStep] = useState(1)
  const [updating, setUpdating] = useState(false)
  const [viewLoader, setViewLoader] = useState({
    testing: false,
    doc: false
  })

  const schema = {
    name: Joi.string().min(3).max(50).trim().required().label('Collection Name'),
    description: Joi.string().allow(null, '').label('Description'),
    defaultView: Joi.string().allow(null, '').label('Default View')
  }

  const setViewloader = (type, flag) => {
    if (flag === 'edit') {
      setUpdating(true)
    } else {
      setViewLoader((prevViewLoader) => ({
        ...prevViewLoader,
        [type]: flag
      }))
    }
  }

  const redirectToCollection = (collection) => {
    if (!collection.data) {
      console.error('collection.data is undefined')
      props.onHide()
      return
    }
    const { id: collectionId } = collection.data
    if (collection.success) {
      const { orgId } = props.match.params
      props.history.push({ pathname: `/orgs/${orgId}/dashboard/collection/${collectionId}/settings` })
    }
    if (props.setDropdownList) props.setDropdownList(collection.data)
    props.onHide()
  }

  const onEditCollectionSubmit = async (defaultView) => {
    props.update_collection(
      {
        ...data,
        id: collectionId,
        defaultView: defaultView
      },
      null,
      redirectToCollection
    )
  }

  const onAddCollectionSubmit = async (defaultView) => {
    const requestId = shortid.generate()
    const defaultDocProperties = {
      defaultLogoUrl: '',
      defaultTitle: data?.title
    }
    props.add_collection({ ...data, docProperties: defaultDocProperties, requestId, defaultView }, null, redirectToCollection)
    setData({
      name: '',
      description: '',
      defaultView: defaultViewTypes.TESTING
    })
    moveToNextStep(1)
  }

  const doSubmit = (defaultView) => {
    const currentErrors = validate({ name: data.name }, schema)
    if (currentErrors) {
      setErrors(currentErrors)
      return null
    }
    const body = data
    body.name = body.name.trim()
    if (props.title === 'Edit Collection') {
      onEditCollectionSubmit(defaultView)
    }
    if (props.title === 'Add new Collection') {
      onAddCollectionSubmit(defaultView)
      if (props.setDropdownList) props.onHide()
    }
  }

  const saveCollection = (defaultView, flag) => {
    setViewloader(defaultView, flag)
    doSubmit(defaultViewTypes.TESTING)
  }

  const onSave = () => {
    saveCollection(defaultViewTypes.TESTING, 'edit')
  }

  const renderSaveButton = () => {
    return (
      <button className='btn btn-primary btn-sm fs-4' onClick={onSave}>
        Save
      </button>
    )
  }

  const renderInModal = () => {
    return (
      <div>
        <InputModal
          props={props}
          show={props.show}
          onHide={props.onHide}
          onSave={onSave}
          Save={'Save'}
          data={data}
          setData={setData}
          onChange={handleChange}
          //conflict if use name instead of name1
          name1={'name'}
          label={'Collection Name'}
          mandatory={true}
          note={'*collection name accepts min 3 and max 50 characters'}
        />
        {/* <Modal size='sm' animation={false} aria-labelledby='contained-modal-title-vcenter' centered onHide={props.onHide} show={props.show}>
          <div>
            <Modal.Header className='custom-collection-modal-container' closeButton>
              <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{renderForm()}</Modal.Body>
          </div>
        </Modal> */}
      </div>
    )
  }

  const handleChange = ({ target: input }) => {
    const { name, value } = input
    setData((prevData) => ({
      ...prevData,
      [name]: value
    }))
  }

  const renderCollectionDetailsForm = () => {
    return (
      <>
        <Input
          name={'name'}
          urlName={'Name'}
          label={'Collection Name'}
          value={data['name']}
          onChange={handleChange}
          mandatory={true}
          note={'*collection name accepts min 3 and max 50 characters'}
        />
        {renderSaveButton()}
      </>
    )
  }

  const renderForm = () => {
    return <>{step === 1 && renderCollectionDetailsForm()}</>
  }
  return props.showOnlyForm ? renderForm() : renderInModal()
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionForm)
