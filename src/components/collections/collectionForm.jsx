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
      step: 1,
      viewLoader: {
        testing: false,
        doc: false
      }
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

  redirectToCollection (collection) {
    const { viewLoader } = this.state
    if (viewLoader.doc) {
      const { orgId } = this.props.match.params
      const { id: collectionId } = collection.data
      this.props.history.push({ pathname: `/orgs/${orgId}/dashboard/collection/${collectionId}/settings` })
    }
    this.props.onHide()
  }

  async onAddCollectionSubmit (defaultView) {
    // this.props.onHide()
    const requestId = shortid.generate()
    const defaultDocProperties = {
      defaultLogoUrl: '',
      defaultTitle: '',
      versionHosts: {}
    }
    this.props.add_collection({ ...this.state.data, docProperties: defaultDocProperties, requestId, defaultView }, null, this.redirectToCollection.bind(this))
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

  setViewLoader (type, flag) {
    const { viewLoader } = this.state
    this.setState({ viewLoader: { ...viewLoader, [type]: flag } })
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

  saveCollection (defaultView, flag) {
    this.setViewLoader(defaultView, flag)
    this.doSubmit(defaultView)
  }

  renderCollectionDetailsForm () {
    return (
      <>
        {this.renderInput('name', 'Name', 'Collection Name', true, true, false, '*collection name accepts min 3 and max 20 characters')}
        {this.renderInput('website', 'Website', 'https://yourwebsite.com', true, false, true)}
      </>
    )
  }

  renderDefaultViewForm () {
    return (
      <DefaultViewModal viewLoader={this.state.viewLoader} saveCollection={this.saveCollection.bind(this)} onHide={() => this.props.onHide()} />
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
      <button className='btn btn-primary' onClick={() => this.onNext()}>
        Next
      </button>
    )
  }

  renderBackButton () {
    return (
      <button className='btn btn-primary mt-2' onClick={() => this.onBack()}>
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
          size='sm'
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
