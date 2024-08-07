import React, { useState, useEffect } from 'react'
import { Modal, Table } from 'react-bootstrap'
import { useDispatch } from 'react-redux'
import jQuery from 'jquery'
import '../../styles/environmentVariables.scss'
import { addEnvironment, updateEnvironment } from './redux/environmentsActions'
import Joi from 'joi-browser'
import { validate, onEnter } from '../common/utility'
import './environments.scss'
import { getCurrentUser } from '../auth/authServiceV2'

const EnvironmentVariables = ({ title, show, onHide, environment: initialEnvironment }) => {
  const [environment, setEnvironment] = useState({
    name: '',
    variables: {
      BASE_URL: { initialValue: '', currentValue: '' },
      1: { initialValue: '', currentValue: '' }
    }
  })
  const [originalVariableNames, setOriginalVariableNames] = useState(['BASE_URL', '1'])
  const [updatedVariableNames, setUpdatedVariableNames] = useState(['BASE_URL', ''])
  const [errors, setErrors] = useState(null)
  const [environmentType, setEnvironmentType] = useState(0)

  const dispatch = useDispatch()

  useEffect(() => {
    if (title === 'Add new Environment') return

    let environmentCopy = jQuery.extend(true, {}, initialEnvironment)
    const originalVars = Object.keys(environmentCopy.variables)
    const len = originalVars.length
    originalVars.push(len.toString())
    const updatedVars = [...Object.keys(environmentCopy.variables), '']
    environmentCopy.variables[len.toString()] = { initialValue: '', currentValue: '' }

    setEnvironment(environmentCopy)
    setOriginalVariableNames(originalVars)
    setUpdatedVariableNames(updatedVars)
  }, [title, initialEnvironment])

  const schema = {
    name: Joi.string().min(3).max(50).trim().required().label('Environment Name')
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    doSubmit()
  }

  const doSubmit = () => {
    const validationErrors = validate({ name: environment.name }, schema)
    if (validationErrors) {
      setErrors(validationErrors)
      return null
    }

    onHide()
    const envCopy = { ...environment }
    const originalVars = [...originalVariableNames]
    const updatedVars = [...updatedVariableNames]
    delete envCopy.variables[originalVars.pop()]
    updatedVars.pop()

    const updatedVariables = {}
    for (let i = 0; i < updatedVars.length; i++) {
      const variableName = updatedVars[i].trim()
      if (variableName && variableName !== 'deleted') {
        updatedVariables[variableName] = envCopy.variables[originalVars[i]]
      }
    }
    const updatedEnvironment = { variables: updatedVariables }
    const userId = getCurrentUser()?.id

    if (title === 'Add new Environment') {
      dispatch(addEnvironment({ name: environment.name, ...updatedEnvironment, userId }))
      setEnvironment({ name: '', variables: {} })
      setOriginalVariableNames([])
      setUpdatedVariableNames([])
    } else {
      const originalEnvCopy = jQuery.extend(true, {}, initialEnvironment)
      if (JSON.stringify(originalEnvCopy) !== JSON.stringify(updatedEnvironment)) {
        dispatch(updateEnvironment({ id: environment.id, name: environment.name, ...updatedEnvironment, userId }))
      }
    }
  }

  const handleAdd = () => {
    const envCopy = { ...environment }
    const len = originalVariableNames.length
    const originalVars = [...originalVariableNames, len.toString()]
    const updatedVars = [...updatedVariableNames, '']
    if (originalVars[len.toString() - 1] !== '') {
      envCopy.variables[len.toString()] = { initialValue: '', currentValue: '' }
    }
    setEnvironment(envCopy)
    setOriginalVariableNames(originalVars)
    setUpdatedVariableNames(updatedVars)
  }

  const handleChangeEnv = (e) => {
    const envCopy = { ...environment }
    envCopy[e.currentTarget.name] = e.currentTarget.value
    setEnvironment(envCopy)
    setErrors(null)
  }

  const handleChange = (e) => {
    const name = e.currentTarget.name.split('.')
    const lastIndex = originalVariableNames.length - 1

    const originalVars = [...originalVariableNames]
    const updatedVars = [...updatedVariableNames]
    let data = {}
    if (name[1] === 'name') {
      updatedVars[name[0]] = e.currentTarget.value
      data = { updatedVariableNames: updatedVars }
    } else {
      const envCopy = { ...environment }
      envCopy.variables[originalVars[name[0]]][name[1]] = e.currentTarget.value
      data = { environment: envCopy }
    }

    setEnvironment((prev) => ({ ...prev, ...data }))
    setUpdatedVariableNames(updatedVars)
    setOriginalVariableNames(originalVars)

    if (name[0] === lastIndex.toString()) {
      handleAdd()
    }
  }

  const handleDelete = (index) => {
    const updatedVars = [...updatedVariableNames]
    updatedVars[index] = 'deleted'
    setUpdatedVariableNames(updatedVars)
  }

  const handleEnvType = (e) => {
    const envCopy = { ...environment }
    envCopy[e.currentTarget.name] = e.currentTarget.value === 'global' ? '1' : '0'; 
    setEnvironmentType(envCopy)
  }

  return (
    <div onKeyDown={(e) => onEnter(e, doSubmit)}>
      <Modal show={show} onHide={onHide} size='lg' animation={false} aria-labelledby='contained-modal-title-vcenter' centered className='custom-environment'>
        <form onSubmit={handleSubmit}>
          <div className='custom-environment-modal-container'>
            <Modal.Header className='custom-collection-modal-container p-3' closeButton>
              <Modal.Title id='contained-modal-title-vcenter'>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='p-3'>
              <div className='form-group mb-0'>
                <label htmlFor='custom-environment-input'>
                  Environment Name<span className='mx-1 alert alert-danger'>*</span>
                </label>
                <input
                  name='name'
                  value={environment.name}
                  onChange={handleChangeEnv}
                  type='text'
                  id='custom-environment-input'
                  className='form-control'
                  placeholder='Environment Name'
                />
                <div>
                  <small className='muted-text'>*environment name accepts min 3 and max 50 characters</small>
                </div>
                {errors?.name && <div className='alert alert-danger'>{errors?.name}</div>}
              </div>
              <div className='form-group py-2'>
                <label htmlFor='custom-environment-input'>Environment Type <span className='mx-1 alert alert-danger'>*</span></label>
                <div>
                  <label className='radio-inline pr-4'>
                    <input
                      type='radio'
                      name='environmentType'
                      value='global'
                      onChange={handleEnvType}
                      className='mr-2 pt-2'
                    />
                    Global Environment
                  </label>
                  <label className='radio-inline ml-3'>
                    <input
                      type='radio'
                      name='environmentType'
                      value='private'
                      onChange={handleEnvType}
                      className='mr-2 pt-2'
                    />
                    Private Environment
                  </label>
                </div>
              </div>
              <div className='custom-table-container env-table'>
                <Table size='sm' className='my-1'>
                  <thead>
                    <tr>
                      <th className='custom-td'>Variable</th>
                      <th className='custom-td'>Initial Value</th>
                      <th className='custom-td'>Current Value</th>
                      <th className='custom-td'>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {updatedVariableNames.map((variable, index) =>
                      variable !== 'deleted' ? (
                        <tr key={index}>
                          <td className='custom-td'>
                            <input
                              name={index + '.name'}
                              value={variable}
                              onChange={handleChange}
                              type='text'
                              style={{ border: 'none' }}
                              className='form-control'
                            />
                          </td>
                          <td className='custom-td'>
                            <input
                              name={index + '.initialValue'}
                              value={environment.variables[originalVariableNames[index]].initialValue}
                              onChange={handleChange}
                              type='text'
                              className='form-control'
                              style={{ border: 'none' }}
                            />
                          </td>
                          <td className='custom-td'>
                            <input
                              name={index + '.currentValue'}
                              value={environment.variables[originalVariableNames[index]].currentValue}
                              onChange={handleChange}
                              type='text'
                              style={{ border: 'none' }}
                              className='form-control'
                            />
                          </td>
                          {updatedVariableNames.length - 1 !== index && (
                            <td className='custom-td'>
                              <button type='button' className='btn btn-light btn-sm btn-block' onClick={() => handleDelete(index)}>
                                <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                  <path
                                    d='M2.25 4.5H3.75H15.75'
                                    stroke='#E98A36'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                  <path
                                    d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z'
                                    stroke='#E98A36'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                  <path
                                    d='M7.5 8.25V12.75'
                                    stroke='#E98A36'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                  <path
                                    d='M10.5 8.25V12.75'
                                    stroke='#E98A36'
                                    strokeWidth='1.5'
                                    strokeLinecap='round'
                                    strokeLinejoin='round'
                                  />
                                </svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      ) : null
                    )}
                  </tbody>
                </Table>
              </div>
            </Modal.Body>
            <div className='custom-table-footer p-3'>
              <div className='text-left'>
                <button className='btn btn-primary btn-sm fs-4 mr-2' id='add_env_save_btn'>
                  Save
                </button>
                <button className='btn btn-secondary outline btn-sm fs-4' onClick={onHide}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default EnvironmentVariables
