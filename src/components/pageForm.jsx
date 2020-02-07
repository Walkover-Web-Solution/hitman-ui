import React from 'react'
import Form from './common/form'
import { Modal } from 'react-bootstrap'
import Joi from 'joi-browser'
import { Link } from 'react-router-dom'

class PageForm extends Form {
  state = {
    data: {
      name: ''
    },
    errors: {}
  }

  schema = {
    name: Joi.string()
      .required()
      .label('Page name')
  }

  async doSubmit (props) {
    if (this.props.title === 'Add New Page') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        newPage: this.state.data,
        versionId: parseInt(this.props.location.pathname.split('/')[5]),
        groupId: parseInt(this.props.location.pathname.split('/')[7])
      })
    }
    if (this.props.title === 'Add New Version Page') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        newPage: this.state.data,
        versionId: parseInt(this.props.location.pathname.split('/')[5])
      })
    }

    if (this.props.title === 'Edit Page') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedPage: this.state.data,
        pageId: this.state.pageId,
        versionId: this.state.versionId
      })
    }
  }

  render () {
    if (this.props.location.editPage) {
      const { id, versionId, name, contents } = this.props.location.editPage
      this.state.pageId = id
      this.state.versionId = versionId
      this.state.data.name = name
      this.state.data.contents = contents
      this.props.history.replace({ editPage: null })
    }
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
            {this.renderInput('name', 'Page name')}
            {this.renderButton('Submit')}
            <Link to={`/dashboard/collections`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default PageForm
