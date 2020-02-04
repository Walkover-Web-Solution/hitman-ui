import React from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import Form from './common/form'
import Joi from 'joi-browser'
class GroupForm extends Form {
  state = {
    data: {
      name: '',
      host: ''
    },
    errors: {}
  }

  schema = {
    name: Joi.string()
      .required()
      .label('Group Name'),
    host: Joi.string()
      .required()
      .label('Host')
  }

  async doSubmit (props) {
    if (this.props.title === 'Add new Group') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        newGroup: this.state.data,
        versionId: parseInt(this.props.location.pathname.split('/')[5])
      })
    }

    if (this.props.title === 'Edit Group') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedGroup: this.state.data,
        groupId: this.state.groupId,
        versionId: this.state.versionId
      })
    }
  }

  render () {
    if (this.props.location.editGroup) {
      const { id, versionId, name, host } = this.props.location.editGroup
      this.state.groupId = id
      this.state.versionId = versionId
      this.state.data.name = name
      this.state.data.host = host
      this.props.history.replace({ editGroup: null })
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
            {this.renderInput('name', 'Group Name*')}
            {this.renderInput('host', 'Host*')}
            {this.renderButton('Submit')}
            <Link to={`/dashboard/collections/`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default GroupForm
