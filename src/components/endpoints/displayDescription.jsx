import React, { Component } from 'react'
import { isDashboardRoute, isSavedEndpoint } from '../common/utility'
import ReactQuill from 'react-quill'
import ReactHtmlParser from 'react-html-parser'
import { Link } from 'react-router-dom'
import { updateEndpoint } from './redux/endpointsActions'
import { connect } from 'react-redux'
import './endpointBreadCrumb.scss'
import { ReactComponent as EditIcon } from '../../assets/icons/editIcon.svg'
import EndpointBreadCrumb from './endpointBreadCrumb'

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

    this.modules = {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ color: [] }, { background: [] }],

        [({ list: 'ordered' }, { list: 'bullet' })],
        ['link']
      ]
    }

    this.formats = [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'color',
      'background',
      'list',
      'bullet',
      'link'
    ]
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
    const value = this.props.endpoint.description
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

  handleChangeDescription = (value) => {
    const endpoint = { ...this.props.endpoint }
    endpoint.description = value
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
              {this.props.endpoint.name &&
                <EndpointBreadCrumb
                  {...this.props}
                  isEndpoint
                />}
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
                            <div className='d-flex align-items-center'>

                              <div
                                className='endpoint-description-text'
                              >
                                {ReactHtmlParser(this.props.endpoint.description)}
                              </div>

                              <button
                                className='btn btn-default'
                                onClick={() => this.handleDescription()}
                              >
                                <EditIcon />
                              </button>
                            </div>
                            )
                          : (
                            <div className='endpoint-description-text'>
                              Description: {ReactHtmlParser(this.props.endpoint.description)}
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
                    <ReactQuill
                      value={this.props.endpoint.description}
                      modules={this.modules}
                      formats={this.formats}
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
