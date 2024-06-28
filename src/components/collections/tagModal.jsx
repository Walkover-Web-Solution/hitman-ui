import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { onEnter } from '../common/utility'

const TagManagerModal = (props) => {
  const [data, setData] = useState({ gtmId: '' })
  const [errors, setErrors] = useState({})

  const schema = {
    gtmId: Joi.string().required().label('GTM-ID')
  }

  useEffect(() => {
    const initialData = { gtmId: '' }
    if (props.collection_id) {
      initialData.gtmId = props.collections[props.collection_id].gtmId
    }
    setData(initialData)
  }, [props.collection_id, props.collections])

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationResult = validate()
    if (validationResult) {
      setErrors(validationResult)
      return
    }
    await doSubmit()
  }

  const validate = () => {
    const options = { abortEarly: false }
    const { error } = Joi.validate(data, schema, options)
    if (!error) return null

    const validationErrors = {}
    for (let item of error.details) validationErrors[item.path[0]] = item.message
    return validationErrors
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit(e)
    }
  }

  const handleChange = ({ currentTarget: input }) => {
    const newData = { ...data }
    newData[input.name] = input.value
    setData(newData)
  }

  const renderInput = (name, label, placeholder, required = false) => (
    <div className='form-group'>
      <label htmlFor={name}>{label}</label>
      <input
        value={data[name]}
        onChange={handleChange}
        id={name}
        name={name}
        type='text'
        className='form-control'
        placeholder={placeholder}
        required={required}
      />
      {errors[name] && <div className='alert alert-danger'>{errors[name]}</div>}
    </div>
  )

  const renderButton = (label) => (
    <button disabled={validate()} className='btn btn-primary'>
      {label}
    </button>
  )

  const doSubmit = async () => {
    const collection = props.collections[props.collection_id]
    const updatedCollection = { ...collection, gtmId: data.gtmId }
    delete updatedCollection?.isPublic
    props.update_collection(updatedCollection)
    props.onHide()
  }

  return (
    <div onKeyPress={handleKeyPress}>
      <Modal {...props} size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered>
        <div>
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{props.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={handleSubmit}>
              {renderInput('gtmId', 'GTM-ID', 'GTM-ID', true)}
              <div className='text-left mt-2 mb-2'>
                {renderButton('Submit')}
                <button type='button' className='btn btn-secondary outline btn-sm fs-4 ml-2' onClick={props.onHide}>
                  Cancel
                </button>
              </div>
            </form>
          </Modal.Body>
        </div>
      </Modal>
    </div>
  )
}

export default TagManagerModal
