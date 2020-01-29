import React from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import Form from './common/form'
import Joi from 'joi-browser'
import collectionVersionsService from '../services/collectionVersionsService'
import groupsService from '../services/groupsService'

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
    // this.state.editCollectionVersion = false
    // if (this.props.title === 'Edit Group') {
    //   this.state.data.id = this.props.selectedcollectionversion.id
    //   this.props.history.push({
    //     pathname: `/collections`,
    //     state: {
    //       newCollectionVersion: { ...this.state.data },
    //       collectionidentifier: this.props.selectedcollection
    //         ? this.props.selectedcollection.identifier
    //         : this.props.collectionidentifier
    //     }
    //   })
    // }
    if (this.props.title === 'Add new Group') {
      await groupsService.saveGroup(this.props.versionId, this.state.data)
      this.props.history.push({
        pathname: `/collections`,
        newGroup: this.state.data,
        versionId: this.props.location.pathname.split('/')[4],
        collectionId: this.props.location.pathname.split('/')[2]
      })
      // }
    }
  }

  render () {
    // if (
    //   this.props.selectedcollectionversion &&
    //   this.state.editCollectionVersion
    // ) {
    //   this.state.editCollectionVersion = false
    //   this.state.data.number = this.props.selectedcollectionversion.number
    //   this.state.data.host = this.props.selectedcollectionversion.host
    // }

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
            <Link to={`/collections/`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default GroupForm
