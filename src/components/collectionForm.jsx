import React from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import Form from './common/form'
import Joi from 'joi-browser'
import collectionsService from '../services/collectionsService'

class CollectionForm extends Form {
  state = {
    data: {
      name: '',
      website: '',
      description: '',
      keyword: '',
      keyword1: '',
      keyword2: ''
    },
    collectionId: '',
    errors: {}
  }

  async componentDidMount () {
    if (this.props.title === 'Add new Collection') return
    let data = {}
    const collectionId = this.props.location.pathname.split('/')[3]
    if (this.props.location.edited_collection) {
      const {
        name,
        website,
        description,
        keyword
      } = this.props.location.edited_collection
      data = {
        name,
        website,
        description,
        keyword: keyword.split(',')[0],
        keyword1: keyword.split(',')[1],
        keyword2: keyword.split(',')[2]
      }
    } else {
      const { data: editedCollection } = await collectionsService.getCollection(
        collectionId
      )
      const { name, website, description, keyword } = editedCollection
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

  schema = {
    name: Joi.string()
      .required()
      .label('Username'),
    website: Joi.string()
      .required()
      .label('Website'),
    keyword: Joi.string()
      .required()
      .label('Keywords'),
    keyword1: Joi.string()
      .allow(null, '')
      .label('Keywords'),
    keyword2: Joi.string()
      .allow(null, '')
      .label('Keywords'),
    description: Joi.string()
      .allow(null, '')
      .label('Description')
  }

  async doSubmit () {
    var body = this.state.data
    body.keyword = body.keyword + ',' + body.keyword1 + ',' + body.keyword2
    delete body.keyword1
    delete body.keyword2
    if (this.props.title === 'Edit Collection') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedCollection: { ...this.state.data, id: this.state.collectionId }
      })
    }
    if (this.props.title === 'Add new Collection') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        newCollection: { ...this.state.data }
      })
    }
  }

  render () {
    return (
      <Modal
        {...this.props}
        size='lg'
        aria-labelledby='contained-modal-title-vcenter'
        centered
      >
        <Modal.Header>
          <Modal.Title id='contained-modal-title-vcenter'>
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput('name', 'Name*')}
            {this.renderInput('website', 'Website*', 'url')}
            <div className='row'>
              <div className='col'>
                {this.renderInput('keyword', 'Keyword 1*')}
              </div>
              <div className='col'>
                {this.renderInput('keyword1', 'Keyword 2')}
              </div>
              <div className='col'>
                {this.renderInput('keyword2', 'Keyword 3')}
              </div>
            </div>
            {this.renderInput('description', 'Description', 'textbox')}
            {this.renderButton('Submit')}
            <Link to='/dashboard/collections'>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default CollectionForm
