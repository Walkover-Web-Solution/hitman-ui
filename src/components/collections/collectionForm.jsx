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
      name: Joi.string().required().label('Username'),
      website: Joi.string().required().label('Website'),
      keyword: Joi.string().required().label('Keywords'),
      keyword1: Joi.string().allow(null, '').label('Keywords'),
      keyword2: Joi.string().allow(null, '').label('Keywords'),
      description: Joi.string().allow(null, '').label('description')
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
    this.props.add_collection({ ...this.state.data, requestId })
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
    body.keyword = body.keyword + ',' + body.keyword1 + ',' + body.keyword2
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
        {...this.props}
        size='lg'
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
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
              {this.renderInput('name', 'Name*', 'Collection Name')}
              {this.renderInput('website', 'Website*', 'Website')}
              <div className='row'>
                <div className='col'>
                  {this.renderInput('keyword', 'Keyword 1*', 'Keyword 1')}
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
              {this.renderButton('Submit')}
              <button
                className='btn btn-secondary btn-lg ml-2'
                onClick={() => this.props.onHide()}
              >
                Cancel
              </button>
            </form>
          </Modal.Body>
        </div>
      </Modal>
    )
  }
}

export default connect(null, mapDispatchToProps)(CollectionForm)
