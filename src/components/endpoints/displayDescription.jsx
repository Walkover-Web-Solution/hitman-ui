import React, { Component } from 'react'
import { isDashboardRoute, isSavedEndpoint } from '../common/utility'

import { Link } from 'react-router-dom'
import { updateEndpoint } from './redux/endpointsActions'
import { connect } from 'react-redux'

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_endpoint: (editedEndpoint) =>
      dispatch(updateEndpoint(editedEndpoint))
  }
}

class DisplayDescription extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showDescriptionFormFlag: false,
      showAddDescriptionFlag: isDashboardRoute(this.props)
        ? !!(this.props.endpoint.description === '' ||
          this.props.endpoint.description == null)
        : false,
      theme: ''
    }
  }

  handleChange (e) {
    const data = { ...this.props.data }
    data[e.currentTarget.name] = e.currentTarget.value
    this.props.props_from_parent('data', data)
  };

  componentDidMount () {
    if (!this.state.theme) {
      this.setState({ theme: this.props.publicCollectionTheme })
    }
  }

  handleDescription () {
    const showDescriptionFormFlag = true
    const showAddDescriptionFlag = false
    this.setState({ showDescriptionFormFlag, showAddDescriptionFlag })
  }

  handleDescriptionCancel () {
    const endpoint = { ...this.props.endpoint }
    endpoint.description = this.props.old_description
    const showDescriptionFormFlag = false
    this.setState({
      showDescriptionFormFlag,
      showAddDescriptionFlag: true
    })
    this.props.props_from_parent('endpoint', endpoint)
  }

  handleDescriptionSave (e) {
    e.preventDefault()
    const value = e.target.description.value
    const endpoint = { ...this.props.endpoint }

    this.props.update_endpoint({ id: endpoint.id, description: value })

    endpoint.description = value
    this.setState({
      showDescriptionFormFlag: false,
      showAddDescriptionFlag: true
    })
    this.props.props_from_parent('endpoint', endpoint)
    this.props.props_from_parent('oldDescription', value)
  }

  handleChangeDescription = (e) => {
    const endpoint = { ...this.props.endpoint }
    endpoint[e.currentTarget.name] = e.currentTarget.value
    this.props.props_from_parent('endpoint', endpoint)
  };

  render () {
    return (
      <div className='endpoint-header'>
        <div
          className={
            isDashboardRoute(this.props)
              ? 'panel-endpoint-name-container'
              : 'endpoint-name-container'
          }
        >
          {isDashboardRoute(this.props) && (
            <>
              <div className='form-group'>
                <label className='hm-panel-label'>Endpoint title</label>
                <input
                  type='text'
                  className='form-control'
                  aria-label='Username'
                  aria-describedby='addon-wrapping'
                  name='name'
                  placeholder='Endpoint Name'
                  value={this.props.data.name}
                  onChange={this.handleChange.bind(this)}
                  disabled={isDashboardRoute(this.props) ? null : true}
                />
              </div>
            </>
          )}
        </div>

        {
          isSavedEndpoint(this.props) && !this.state.showDescriptionFormFlag
            ? (
                this.state.showAddDescriptionFlag &&
                (
                  this.props.endpoint.description === '' ||
                  this.props.endpoint.description === null
                ) &&
                isDashboardRoute(this.props)
                  ? (
                    <Link
                      class='adddescLink'
                      onClick={() => this.handleDescription()}
                    >
                      <svg width='16' height='16' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 3.75V14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.75 9H14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg> Add a Description
                    </Link>
                    )
                  : (
                    <>
                      <div className='endpoint-description'>
                        {isDashboardRoute(this.props)
                          ? (
                            <div>
                              <label className='hm-panel-label'>
                                Endpoint Description
                              </label>
                              <button
                                className='btn btn-default'
                                onClick={() => this.handleDescription()}
                              >
                                <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                                  <path d='M9 15H15.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                  <path d='M12.375 2.62517C12.6734 2.3268 13.078 2.15918 13.5 2.15918C13.7089 2.15918 13.9158 2.20033 14.1088 2.28029C14.3019 2.36024 14.4773 2.47743 14.625 2.62517C14.7727 2.77291 14.8899 2.9483 14.9699 3.14132C15.0498 3.33435 15.091 3.54124 15.091 3.75017C15.091 3.9591 15.0498 4.16599 14.9699 4.35902C14.8899 4.55204 14.7727 4.72743 14.625 4.87517L5.25 14.2502L2.25 15.0002L3 12.0002L12.375 2.62517Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                                </svg>

                              </button>
                              <br />
                              <div
                                className='endpoint-description-text'
                              >
                                <p>{this.props.endpoint.description}</p>
                              </div>
                            </div>
                            )
                          : (
                            <div className='endpoint-description-text'>
                              Description: {this.props.endpoint.description}
                            </div>
                            )}
                      </div>
                    </>
                    )
              )
            : null
        }

        {
          isDashboardRoute(this.props) && isSavedEndpoint(this.props) && this.state.showDescriptionFormFlag
            ? (
              <form onSubmit={this.handleDescriptionSave.bind(this)}>
                <div className='endpoint-description-wrap'>
                  <div className='form-group'>
                    <label className='hm-panel-label'>Endpoint Description</label>
                    <textarea
                      className='form-control'
                      rows='5'
                      name='description'
                      placeholder='Make things easier for your teammates with a complete endpoint description'
                      value={this.props.endpoint.description}
                      onChange={this.handleChangeDescription}
                    />
                  </div>
                  <div className='endpoint-cta'>
                    <button
                      className='btn btn-secondary outline btn-lg'
                      type='cancel'
                      onClick={() => this.handleDescriptionCancel()}
                    >
                      Cancel
                    </button>
                    <button className='btn btn-primary btn-lg' type='submit'>
                      Save
                    </button>
                  </div>
                </div>
              </form>
              )
            : null
        }
      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(DisplayDescription)
