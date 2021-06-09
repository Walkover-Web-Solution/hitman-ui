import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { toTitleCase, onEnter } from '../common/utility'
import shortid from 'shortid'
import { connect } from 'react-redux'
import { addCollection, updateCollection } from './redux/collectionsActions'
import { moveToNextStep } from '../../services/widgetService'

const mapStateToProps = (state) => {
  return {
    collections: state.collections
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    add_collection: (newCollection, openSelectedCollection) => dispatch(addCollection(newCollection, openSelectedCollection)),
    update_collection: (editedCollection) =>
      dispatch(updateCollection(editedCollection))
  }
}

class CollectionForm extends Form {
  constructor (props) {
    super(props)
    this.state = {
      data: {
        name: '',
        website: '',
        description: '',
        keyword: '',
        keyword1: '',
        keyword2: ''
      },
      collectionId: '',
      errors: {},
      show: true
    }

    this.schema = {
      name: Joi.string().trim().required().label('Collection Name'),
      website: Joi.string().uri().trim().required().label('Website'),
      keyword: Joi.string().trim().allow(null, '').label('Keywords'),
      keyword1: Joi.string().trim().allow(null, '').label('Keywords'),
      keyword2: Joi.string().trim().allow(null, '').label('Keywords'),
      description: Joi.string().allow(null, '').label('Description')
    }
  }

  async componentDidMount () {
    if (!this.props.show || this.props.title === 'Add new Collection') return
    let data = {}
    const collectionId = this.props.edited_collection.id
    if (this.props.edited_collection) {
      const {
        name,
        website,
        description,
        keyword
      } = this.props.edited_collection
      data = {
        name,
        website,
        description,
        keyword: keyword.split(',')[0],
        keyword1: keyword.split(',')[1],
        keyword2: keyword.split(',')[2]
      }
    }
    this.setState({ data, collectionId })
  }

  async onEditCollectionSubmit () {
    this.props.onHide()
    this.props.update_collection({
      ...this.state.data,
      id: this.state.collectionId
    })
    this.setState({
      data: {
        name: '',
        website: '',
        description: '',
        keyword: '',
        keyword1: '',
        keyword2: ''
      }
    })
  }

  async onAddCollectionSubmit () {
    this.props.onHide()
    const requestId = shortid.generate()
    const defaultDocProperties = {
      defaultLogoUrl: '',
      defaultTitle: '',
      versionHosts: {}
    }
    this.props.add_collection({ ...this.state.data, docProperties: defaultDocProperties, requestId }, this.props.open_selected_collection)
    this.setState({
      data: {
        name: '',
        website: '',
        description: '',
        keyword: '',
        keyword1: '',
        keyword2: ''
      }
    })
    moveToNextStep(1)
  }

  async doSubmit () {
    const body = this.state.data
    body.name = toTitleCase(body.name.trim())
    body.website = body.website.trim()
    body.keyword = body.name + ',' + body.keyword1.trim() + ',' + body.keyword2.trim()
    delete body.keyword1
    delete body.keyword2
    if (this.props.title === 'Edit Collection') {
      this.onEditCollectionSubmit()
    }
    if (this.props.title === 'Add new Collection') {
      this.onAddCollectionSubmit()
    }
  }

  renderForm () {
    return (
      <form onSubmit={this.handleSubmit}>
        {this.renderInput('name', 'Name', 'Collection Name', true, true)}
        {this.renderInput('website', 'Website', 'https://yourwebsite.com', true)}
        {/* <div className='row'>
          <div className='col'>
            {this.renderInput('keyword', 'Keyword 1', 'Keyword 1', true)}
          </div>
          <div className='col'>
            {this.renderInput('keyword1', 'Keyword 2', 'Keyword 2')}
          </div>
          <div className='col'>
            {this.renderInput('keyword2', 'Keyword 3', 'Keyword 3')}
          </div>
        </div> */}
        {this.renderQuillEditor('descriptoion', 'Description')}
        <div className='text-left mt-4 mb-2'>
          {this.renderButton('Submit')}

          <button
            className='btn btn-secondary outline btn-lg outline ml-2'
            onClick={(e) => { this.handleCancel(e) }}
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  handleCancel (e) {
    e.preventDefault()
    this.props.showOnlyForm ? this.props.onCancel() : this.props.onHide()
  }

  renderInModal () {
    return (
      <div onKeyPress={(e) => { onEnter(e, this.handleKeyPress.bind(this)) }}>
        <Modal
          size='lg'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
          onHide={this.props.onHide}
          show={this.props.show}
        >
          <div>
            <Modal.Header
              className='custom-collection-modal-container'
              closeButton
            >
              <Modal.Title id='contained-modal-title-vcenter'>
                {this.props.title}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {this.renderForm()}
            </Modal.Body>
          </div>
        </Modal>
      </div>
    )
  }

  render () {
    return (
      this.props.showOnlyForm ? this.renderForm() : this.renderInModal()
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CollectionForm)
