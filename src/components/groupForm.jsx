import React from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import Form from './common/form'
import Joi from 'joi-browser'
import groupsService from '../services/groupsService'
class GroupForm extends Form {
  state = {
    data: {
      name: '',
      host: ''
    },
    groupId: '',
    versionId: '',
    errors: {}
  }

  async componentDidMount () {
    if (this.props.title === 'Add new Group') return
    let data = {}
    const groupId = this.props.location.pathname.split('/')[7]
    const versionId = this.props.location.pathname.split('/')[5]
    if (this.props.title === 'Add new Group') return
    if (this.props.location.editGroup) {
      const { name, host } = this.props.location.editGroup
      data = { name, host }
    } else {
      const {
        data: { name, host }
      } = await groupsService.getGroup(groupId)
      data = { name, host }
    }
    this.setState({ data, groupId, versionId })
  }

  schema = {
    name: Joi.string()
      .required()
      .label('Group Name'),
    host: Joi.string()
      .uri()
      .allow(null, '')
      .label('Host')
  }

  async doSubmit () {
    if (this.props.title === 'Add new Group') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        newGroup: this.state.data,
        versionId: parseInt(this.props.location.pathname.split('/')[5])
      })
    }

    if (this.props.title === 'Edit Group') {
      console.log(this.state.versionId)
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedGroup: {
          ...this.state.data,
          id: this.state.groupId,
          versionId: parseInt(this.props.location.pathname.split('/')[5])
        }
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
