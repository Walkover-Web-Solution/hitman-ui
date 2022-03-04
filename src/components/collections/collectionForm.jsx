import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { toTitleCase, onEnter, DEFAULT_URL } from '../common/utility'
import shortid from 'shortid'
import { connect } from 'react-redux'
import { addCollection, updateCollection } from './redux/collectionsActions'
import { moveToNextStep } from '../../services/widgetService'
import { URL_VALIDATION_REGEX } from '../common/constants'
import DefaultViewModal from './defaultViewModal/defaultViewModal'

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
        website: DEFAULT_URL,
        description: '',
        keyword: '',
        keyword1: '',
        keyword2: '',
        defaultView: 'testing'
      },
      collectionId: '',
      errors: {},
      show: true,
      step: 1
    }

    this.schema = {
      name: Joi.string().min(3).max(20).trim().required().label('Collection Name'),
      website: Joi.string().min(3).regex(URL_VALIDATION_REGEX, { name: 'URL' }).trim().required().label('Website').error(() => { return { message: 'Website must be a valid URL' } }),
      keyword: Joi.string().trim().allow(null, '').label('Keywords'),
      keyword1: Joi.string().trim().allow(null, '').label('Keywords'),
      keyword2: Joi.string().trim().allow(null, '').label('Keywords'),
      description: Joi.string().allow(null, '').label('Description'),
      defaultView: Joi.string().allow(null, '').label('Default View')
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

  async onEditCollectionSubmit (defaultView) {
    this.props.onHide()
    this.props.update_collection({
      ...this.state.data,
      id: this.state.collectionId,
      defaultView
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

  async onAddCollectionSubmit (defaultView) {
    this.props.onHide()
    const requestId = shortid.generate()
    const defaultDocProperties = {
      defaultLogoUrl: '',
      defaultTitle: '',
      versionHosts: {}
    }
    this.props.add_collection({ ...this.state.data, docProperties: defaultDocProperties, requestId, defaultView }, this.props.open_selected_collection)
    this.setState({
      data: {
        name: '',
        website: '',
        description: '',
        keyword: '',
        keyword1: '',
        keyword2: '',
        defaultView: 'testing'
      }
    })
    moveToNextStep(1)
  }

  async doSubmit (defaultView) {
    const body = this.state.data
    body.name = toTitleCase(body.name.trim())
    body.website = body.website.trim()
    body.keyword = body.name + ',' + body.keyword1.trim() + ',' + body.keyword2.trim()
    delete body.keyword1
    delete body.keyword2
    if (this.props.title === 'Edit Collection') {
      this.onEditCollectionSubmit(defaultView)
    }
    if (this.props.title === 'Add new Collection') {
      this.onAddCollectionSubmit(defaultView)
    }
  }

  saveCollection (defaultView) {
    this.doSubmit(defaultView)
  }

  renderCollectionDetailsForm () {
    return (
    // <form onSubmit={this.handleSubmit}>
      <>
        {this.renderInput('name', 'Name', 'Collection Name', true, true, false, '*collection name accepts min 3 and max 20 characters')}
        {this.renderInput('website', 'Website', 'https://yourwebsite.com', true, false, true)}
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
        <div className='text-left mt-4 mb-2'>
          {/* {this.renderButton('Submit')}

          <button
            className='btn btn-secondary outline btn-lg outline ml-2'
            onClick={(e) => { this.handleCancel(e) }}
          >
            Cancel
          </button> */}
        </div>
      </>
    // </form>
    )
  }

  renderDefaultViewForm () {
    return (
      <DefaultViewModal saveCollection={this.saveCollection.bind(this)} />
    )
  }

  renderForm () {
    const { step } = this.state
    return (
      <>
        {step === 1 && this.renderCollectionDetailsForm()}
        {step === 2 && this.renderDefaultViewForm()}
        {step === 1 ? this.renderNextButton() : this.renderBackButton()}
      </>
    )
  }

  onBack () {
    this.setState({ step: 1 })
  }

  onNext () {
    const errors = this.validate()
    this.setState({ errors: errors || {} })
    if (errors) return
    this.setState({ step: 2 })
  }

  renderNextButton () {
    return (
      <button onClick={() => this.onNext()}>
        Next
      </button>
    )
  }

  renderBackButton () {
    return (
      <button onClick={() => this.onBack()}>
        Back
      </button>
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
