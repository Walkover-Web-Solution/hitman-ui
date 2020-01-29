import React from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import Form from './common/form'
import Joi from 'joi-browser'

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
    errors: {},
    redirect: false,
    editCollection: true
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

  async doSubmit (props) {
    var body = this.state.data
    body.keyword = body.keyword + ',' + body.keyword1 + ',' + body.keyword2
    delete body.keyword1
    delete body.keyword2
    this.state.editCollection = true
    if (this.props.title === 'Edit Collection') {
      this.state.data.id = this.props.selectedCollection.id
      this.props.history.push({
        pathname: `/collections`,
        newCollection: { ...this.state.data }
      })
    }
    if (this.props.title === 'Add new Collection') {
      this.props.history.push({
        pathname: `/collections`,
        newCollection: { ...this.state.data }
      })
    }
  }

  render () {
    if (this.props.selectedCollection && this.state.editCollection) {
      this.state.editCollection = false
      this.state.data.name = this.props.selectedCollection.name
      this.state.data.website = this.props.selectedCollection.website
      this.state.data.description = this.props.selectedCollection.description
      this.state.data.keyword = this.props.selectedCollection.keyword.split(
        ','
      )[0]
      this.state.data.keyword1 = this.props.selectedCollection.keyword.split(
        ','
      )[1]
      this.state.data.keyword2 = this.props.selectedCollection.keyword.split(
        ','
      )[2]
    } else this.state.editCollection = null
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
            <Link to='/collections'>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default CollectionForm
