import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import { onEnter, validate } from '../common/utility'
import shortid from 'shortid'
import { connect } from 'react-redux'
import { addCollection, updateCollection } from './redux/collectionsActions'
import { moveToNextStep } from '../../services/widgetService'
import { defaultViewTypes } from './defaultViewModal/defaultViewModal'

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

class CollectionForm extends Form {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        name: '',
        description: '',
        defaultView: defaultViewTypes.TESTING
      },
      collectionId: '',
      errors: {},
      show: true,
      step: 1,
      viewLoader: {
        testing: false,
        doc: false
      },
      updating: false
    }

    this.schema = {
      name: Joi.string().min(3).max(50).trim().required().label('Collection Name'),
      description: Joi.string().allow(null, '').label('Description'),
      defaultView: Joi.string().allow(null, '').label('Default View')
    }
  }

  async componentDidMount() {
    if (!this.props.show || this.props.title === 'Add new Collection') return
    let data = {}
    const collectionId = this.props.edited_collection.id
    if (this.props.edited_collection) {
      const { name, description } = this.props.edited_collection
      data = {
        name,
        description
      }
    }
    this.setState({ data, collectionId })
  }

  async onEditCollectionSubmit(defaultView) {
    this.props.update_collection(
      {
        ...this.state.data,
        id: this.state.collectionId,
        defaultView
      },
      null,
      this.redirectToCollection.bind(this)
    )
  }

  redirectToCollection(collection) {
    const { viewLoader } = this.state
    if (!collection.data) {
      console.error('collection.data is undefined')
      return // or handle this case appropriately
    }
    const { id: collectionId } = collection.data
    if (collection.success) {
      const { orgId } = this.props.match.params
      this.props.history.push({ pathname: `/orgs/${orgId}/dashboard/collection/${collectionId}/settings` })
    }
    if (this.props.setDropdownList) this.props.setDropdownList(collection.data)
    this.props.onHide()
  }

  async onAddCollectionSubmit(defaultView) {
    const requestId = shortid.generate()
    const defaultDocProperties = {
      defaultLogoUrl: '',
      defaultTitle: this.state?.data?.title
    }
    this.props.add_collection(
      { ...this.state.data, docProperties: defaultDocProperties, requestId, defaultView },
      null,
      this.redirectToCollection.bind(this))
    this.setState({
      data: {
        name: '',
        description: '',
        defaultView: defaultViewTypes.TESTING
      }
    })
    moveToNextStep(1)
  }

  setViewLoader(type, flag) {
    if (flag === 'edit') this.setState({ updating: true })
    else {
      const { viewLoader } = this.state
      this.setState({ viewLoader: { ...viewLoader, [type]: flag } })
    }
  }

  async doSubmit(defaultView) {
    const errors = validate({ name: this.state.data.name }, this.schema)
    if (errors) {
      this.setState({ errors })
      return null
    }
    const body = this.state.data
    body.name = body.name.trim()
    if (this.props.title === 'Edit Collection') {
      this.onEditCollectionSubmit(defaultView)
    }
    if (this.props.title === 'Add new Collection') {
      this.onAddCollectionSubmit(defaultView)
        if (this.props.setDropdownList) this.props.onHide()
    }
  }

  saveCollection(defaultView, flag) {
    this.setViewLoader(defaultView, flag)
    this.doSubmit(defaultViewTypes.TESTING)
  }

  renderCollectionDetailsForm() {
    return (
      <>
        {this.renderInput('name', 'Name', 'Collection Name', true, true, false, '*collection name accepts min 3 and max 50 characters')}
        {this.renderSaveButton()}
      </>
    )
  }

  renderSaveButton() {
    return (
      <button className='btn btn-primary btn-sm fs-4' onClick={() => this.saveCollection(defaultViewTypes.TESTING, 'edit')}>
        Save
      </button>
    )
  }

  renderForm() {
    const { step } = this.state
    return <>{step === 1 && this.renderCollectionDetailsForm()}</>
  }

  handleCancel(e) {
    e.preventDefault()
    this.props.showOnlyForm ? this.props.onCancel() : this.props.onHide()
  }

  renderInModal() {
    return (
      <div
        onKeyPress={(e) => {
          onEnter(e, this.handleKeyPress.bind(this))
        }}
      >
        <Modal
          size='sm'
          animation={false}
          aria-labelledby='contained-modal-title-vcenter'
          centered
          onHide={this.props.onHide}
          show={this.props.show}
        >
          <div>
            <Modal.Header className='custom-collection-modal-container' closeButton>
              <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{this.renderForm()}</Modal.Body>
          </div>
        </Modal>
      </div>
    )
  }

  render() {
    return this.props.showOnlyForm ? this.renderForm() : this.renderInModal()
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(CollectionForm)