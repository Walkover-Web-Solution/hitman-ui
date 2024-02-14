import Joi from 'joi-browser'
import React, { createRef } from 'react'
import { connect } from 'react-redux'
import Form from '../common/form'
import './endpoints.scss'
import _ from 'lodash'
import ShowCaseSaveAsModal from './showCaseSaveAsModal/showCaseSaveAsModal'
import Input from '../common/input'
import { trimString } from '../common/utility'

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages
  }
}

class SaveAsSidebar extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        name: '',
        description: ''
      }
    }
    this.saveAsSidebar = createRef()
    this.schema = {
      name: Joi.string().required().label('Endpoint Name'),
      description: Joi.string().allow(null, '').label('Description')
    }
  }

  componentDidMount() {
    const data = { ...this.state.data }
    data.name = this.props?.name
    this.setState({ data })
    this.saveAsSidebar.focus()
  }

  handleEndpointNameChange(e) {
    const dummyData = this.props?.endpointContent
    dummyData.data.name = e.currentTarget.value
    this.props.setQueryUpdatedData(dummyData)
  }

  handleEndpointNameBlur(e) {
    if (!trimString(e.currentTarget.value)) {
      if (this.props?.match?.params?.endpointId !== 'new') {
        this.props.setQueryUpdatedData({
          ...this.props.endpointContent,
          data: { ...this.props.endpointContent.data, name: this.props.pages?.[this.props?.match?.params?.endpointId]?.name || '' }
        })
      } else {
        this.props.setQueryUpdatedData({ ...this.props.endpointContent, data: { ...this.props.endpointContent.data, name: 'Untitled' } })
      }
    }
  }

  renderEndpointNameInput() {
    return (
      <Input
        ref={this.endpointInputRef}
        value={this.props?.endpointContent?.data?.name || ''}
        onChange={(e) => this.handleEndpointNameChange(e)}
        onBlur={(e) => this.handleEndpointNameBlur(e)}
        // error={errors?.[name]}
        placeholder={'Endpoint Name'}
        mandatory={'mandatory'}
        firstLetterCapitalize
        label={'Name'}
      />
    )
  }

  render() {
    const title = this.state.data.name
    const saveAsSidebarStyle = {
      position: 'fixed',
      background: 'white',
      zIndex: '1050 ',
      top: '0px',
      right: '0px',
      height: '100vh',
      width: '35vw',
      boxShadow: '-25px 25px 43px rgba(0, 0, 0, 0.07)',
      overflow: 'hidden'
    }

    return (
      <div>
        <div
          tabIndex={-1}
          ref={(e) => {
            this.saveAsSidebar = e
          }}
          style={saveAsSidebarStyle}
          className='save-as-sidebar-container'
        >
          <div className='custom-collection-modal-container modal-header align-items-center'>
            <div className='modal-title h4'>{this.props.location.pathname.split('/')[5] !== 'new' ? 'Save As' : 'Save'}</div>
            <button
              className='close'
              onClick={() => {
                this.props.onHide()
              }}
            >
              <span aria-hidden='true'>×</span>
            </button>
          </div>
          <div className='drawer-body'>
            <form className='desc-box form-parent' onSubmit={this.handleSubmit}>
              <div className='p-form-group mb-3'>
                {this.renderEndpointNameInput()}
                {title?.trim() === '' || title === 'Untitled' ? <small className='text-danger'>Please enter the Title</small> : <div />}
              </div>
            </form>
            <ShowCaseSaveAsModal
              save_endpoint={this.props.save_endpoint}
              name={this.state.data.name}
              description={this.state.data.description}
              onHide={this.props.onHide}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default connect(mapStateToProps, null)(SaveAsSidebar)
