import React from 'react'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import Form from '../common/form'
import shortid from 'shortid'
import { connect } from 'react-redux'
import { addCollection, updateCollection } from './redux/collectionsActions'

const mapDispatchToProps = (dispatch) => {
  return {
    add_collection: (newCollection) => dispatch(addCollection(newCollection)),
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
      website: Joi.string().trim().required().label('Website'),
      keyword: Joi.string().trim().required().label('Keywords'),
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
      defaultTitle: this.state.data.name || ''
    }
    this.props.add_collection({ ...this.state.data, docProperties: defaultDocProperties, requestId })
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

  async doSubmit () {
    const body = this.state.data
    body.name = body.name.trim()
    body.website = body.website.trim()
    body.keyword = body.keyword.trim() + ',' + body.keyword1.trim() + ',' + body.keyword2.trim()
    delete body.keyword1
    delete body.keyword2
    if (this.props.title === 'Edit Collection') {
      this.onEditCollectionSubmit()
    }
    if (this.props.title === 'Add new Collection') {
      this.onAddCollectionSubmit()
    }
  }

  render () {
    return (
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
            <form onSubmit={this.handleSubmit}>
              {this.renderInput('name', 'Name', 'Collection Name', true)}
              {this.renderInput('website', 'Website', 'Website', true)}
              <div className='row'>
                <div className='col'>
                  {this.renderInput('keyword', 'Keyword 1', 'Keyword 1', true)}
                </div>
                <div className='col'>
                  {this.renderInput('keyword1', 'Keyword 2', 'Keyword 2')}
                </div>
                <div className='col'>
                  {this.renderInput('keyword2', 'Keyword 3', 'Keyword 3')}
                </div>
              </div>
              {/* {this.renderTextArea("description", "Description", "description")} */}
              {this.renderQuillEditor('descriptoion', 'Description')}
              <div className='text-right mt-4 mb-2'>
                <button
                  className='btn btn-secondary outline btn-lg outline mr-2'
                  onClick={() => this.props.onHide()}
                >
                  Cancel
                </button>
                {this.renderButton('Submit')}
              </div>
            </form>
          </Modal.Body>
        </div>
      </Modal>
    )
  }
}

export default connect(null, mapDispatchToProps)(CollectionForm)
