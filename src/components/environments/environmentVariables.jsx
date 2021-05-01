import jQuery from 'jquery'
import React, { Component } from 'react'
import { Modal, Table } from 'react-bootstrap'
import { connect } from 'react-redux'
import shortId from 'shortid'
import '../../styles/environmentVariables.scss'
import { addEnvironment, updateEnvironment } from './redux/environmentsActions'
import Joi from 'joi-browser'
import { validate, onEnter } from '../common/utility'
import './environments.scss'

const mapDispatchToProps = (dispatch) => {
  return {
    add_environment: (newEnvironment) =>
      dispatch(addEnvironment(newEnvironment)),
    update_environment: (editedEnvironment) =>
      dispatch(updateEnvironment(editedEnvironment))
  }
}

class EnvironmentVariables extends Component {
  constructor (props) {
    super(props)
    this.state = {
      environment: {
        name: '',
        variables: {
          BASE_URL: { initialValue: '', currentValue: '' },
          1: { initialValue: '', currentValue: '' }
        }
      },
      originalVariableNames: ['BASE_URL', '1'],
      updatedVariableNames: ['BASE_URL', '']
    }
  }

  async componentDidMount () {
    if (this.props.title === 'Add new Environment') return
    let environment = {}
    environment = jQuery.extend(true, {}, this.props.environment)
    const originalVariableNames = Object.keys(environment.variables)
    const len = originalVariableNames.length
    originalVariableNames.push(len.toString())
    const updatedVariableNames = [...Object.keys(environment.variables), '']
    environment.variables[len.toString()] = {
      initialValue: '',
      currentValue: ''
    }
    this.setState({
      environment,
      originalVariableNames,
      updatedVariableNames
    })
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.doSubmit()
  };

  schema = {
    name: Joi.string().trim().required().label('Evironment Name')
  }

  doSubmit () {
    const errors = validate({ name: this.state.environment.name }, this.schema)
    if (errors) {
      this.setState({ errors })
      return null
    }
    this.props.onHide()
    const environment = { ...this.state.environment }
    const originalVariableNames = [...this.state.originalVariableNames]
    const updatedVariableNames = [...this.state.updatedVariableNames]
    delete environment.variables[originalVariableNames.pop()]
    updatedVariableNames.pop()
    for (let i = 0; i < updatedVariableNames.length; i++) {
      if (updatedVariableNames[i] !== originalVariableNames[i]) {
        if (
          updatedVariableNames[i] === 'deleted' ||
          updatedVariableNames[i] === ''
        ) { delete environment.variables[originalVariableNames[i]] } else {
          environment.variables[updatedVariableNames[i]] =
            environment.variables[originalVariableNames[i]]
          delete environment.variables[originalVariableNames[i]]
        }
      }
    }
    if (this.props.title === 'Add new Environment') {
      this.props.onHide()
      const requestId = shortId.generate()
      this.props.add_environment({ ...this.state.environment, requestId })
      this.setState({
        environment: { name: '', variables: {} },
        originalVariableNames: [],
        updatedVariableNames: []
      })
    } else {
      const updatedEnvironment = { ...this.state.environment }
      const originalEnvironment = jQuery.extend(
        true,
        {},
        this.props.environment
      )
      if (
        JSON.stringify(originalEnvironment) !==
        JSON.stringify(updatedEnvironment)
      ) {
        if (updatedEnvironment.requestId) delete updatedEnvironment.requestId
        this.props.update_environment({
          ...updatedEnvironment
        })
      }
    }
  }

  handleAdd () {
    const environment = { ...this.state.environment }
    const len = this.state.originalVariableNames.length
    const originalVariableNames = [
      ...this.state.originalVariableNames,
      len.toString()
    ]
    const updatedVariableNames = [...this.state.updatedVariableNames, '']
    if (originalVariableNames[len.toString() - 1] !== '') {
      environment.variables[len.toString()] = {
        initialValue: '',
        currentValue: ''
      }
    }
    this.setState({ environment, originalVariableNames, updatedVariableNames })
  }

  handleChangeEnv = (e) => {
    const environment = { ...this.state.environment }
    environment[e.currentTarget.name] = e.currentTarget.value
    this.setState({ environment, errors: null })
  };

  handleChange = (e) => {
    const name = e.currentTarget.name.split('.')
    const lastIndex = this.state.originalVariableNames.length - 1

    const originalVariableNames = [...this.state.originalVariableNames]
    const updatedVariableNames = [...this.state.updatedVariableNames]
    let data = {}
    if (name[1] === 'name') {
      updatedVariableNames[name[0]] = e.currentTarget.value
      data = { updatedVariableNames }
    } else {
      const environment = { ...this.state.environment }
      environment.variables[originalVariableNames[name[0]]][name[1]] =
        e.currentTarget.value
      data = { environment }
    }

    this.setState(data, () => {
      if (name[0] === lastIndex.toString()) {
        this.handleAdd()
      }
    })
  };

  handleDelete (index) {
    const updatedVariableNames = this.state.updatedVariableNames
    updatedVariableNames[index] = 'deleted'
    this.setState({ updatedVariableNames })
  }

  render () {
    return (
      <div onKeyPress={(e) => onEnter(e, this.doSubmit.bind(this))}>
        <Modal
          show={this.props.show}
          onHide={this.props.onHide}
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
        >
          <form onSubmit={this.handleSubmit}>
            <div className='custom-environment-modal-container'>
              <Modal.Header
                className='custom-collection-modal-container'
                closeButton
              >
                <Modal.Title id='contained-modal-title-vcenter'>
                  {this.props.title}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <div className='form-group'>
                  <label htmlFor='custom-environment-input'>
                    Environment Name<span className='mx-1 alert alert-danger'>*</span>
                  </label>
                  <input
                    name='name'
                    value={this.state.environment.name}
                    onChange={this.handleChangeEnv}
                    type='text'
                    id='custom-environment-input'
                    className='form-control'
                    placeholder='Environment Name'
                  />
                  {this.state.errors?.name && <div className='alert alert-danger'>{this.state.errors?.name}</div>}
                </div>
                <div className='custom-table-container env-table'>
                  <Table size='sm'>
                    <thead>
                      <tr>
                        <th className='custom-td'>Variable</th>
                        <th className='custom-td'>Initial Value</th>
                        <th className='custom-td'>Current Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      {
                        this.state.updatedVariableNames.map((variable, index) =>
                          variable !== 'deleted'
                            ? (
                              <tr key={index}>
                                <td className='custom-td'>
                                  <input
                                    name={index + '.name'}
                                    value={variable}
                                    onChange={this.handleChange}
                                    type='text'
                                    style={{ border: 'none' }}
                                    className='form-control'
                                  />
                                </td>
                                <td className='custom-td'>
                                  {' '}
                                  <input
                                    name={index + '.initialValue'}
                                    value={
                                      this.state.environment.variables[
                                        this.state.originalVariableNames[index]
                                      ].initialValue
                                    }
                                    onChange={this.handleChange}
                                    type='text'
                                    className='form-control'
                                    style={{ border: 'none' }}
                                  />
                                </td>
                                <td className='custom-td'>
                                  {' '}
                                  <input
                                    name={index + '.currentValue'}
                                    value={
                                      this.state.environment.variables[
                                        this.state.originalVariableNames[index]
                                      ].currentValue
                                    }
                                    onChange={this.handleChange}
                                    type='text'
                                    style={{ border: 'none' }}
                                    className='form-control'
                                  />
                                </td>
                                {this.state.updatedVariableNames.length - 1 !==
                                  index && (
                                    <td className='custom-td'>
                                      <button
                                        type='button'
                                        className='btn btn-light btn-sm btn-block'
                                        onClick={() => this.handleDelete(index)}
                                      >
                                        <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                          <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                          <path d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                          <path d='M7.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                          <path d='M10.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                        </svg>

                                      </button>
                                    </td>
                                )}
                              </tr>
                              )
                            : null
                        )
                      }
                    </tbody>
                  </Table>
                </div>
                <hr />
                <div>
                  <div className='text-left'>
                    <button className='btn btn-primary btn-lg mr-2' id = 'add_env_save_btn'>
                      Save
                    </button>

                    <button
                      className='btn btn-secondary outline btn-lg'
                      onClick={this.props.onHide}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </Modal.Body>
            </div>
          </form>
        </Modal>
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(EnvironmentVariables)
