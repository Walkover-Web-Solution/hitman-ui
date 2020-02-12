import React from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import Form from './common/form'
import Joi from 'joi-browser'
import collectionVersionsService from '../services/collectionVersionsService'

class CollectionVersionForm extends Form {
  state = {
    data: {
      number: '',
      host: ''
    },
    errors: {},
    versionId: null,
    collectionId: ''
  }

  schema = {
    number: Joi.string()
      .required()
      .label('Version number'),
    host: Joi.string()
      .uri()
      .allow(null, '')
      .label('Host')
  }

  async componentDidMount () {
    let data = {}
    const collectionId = this.props.location.pathname.split('/')[3]
    const versionId = parseInt(this.props.location.pathname.split('/')[5])
    if (this.props.title === 'Add new Collection Version') return
    if (this.props.location.editCollectionVersion) {
      const { number, host } = this.props.location.editCollectionVersion
      data = {
        number,
        host
      }
    } else {
      const {
        data: editedCollectionVersion
      } = await collectionVersionsService.getCollectionVersion(versionId)
      const { number, host } = editedCollectionVersion
      data = {
        number,
        host
      }
    }
    this.setState({ data, versionId, collectionId })
  }

  async doSubmit (props) {
    if (this.props.title === 'Edit Collection Version') {
      this.state.data.id = this.state.versionId
      this.state.data.collectionId = this.state.collectionId
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedCollectionVersion: { ...this.state.data }
      })
    }
    if (this.props.title === 'Add new Collection Version') {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        newCollectionVersion: { ...this.state.data },
        collectionId: this.props.location.pathname.split('/')[3]
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
            {this.renderInput('number', 'Version Number')}
            {this.renderInput('host', 'Host*')}
            {this.renderButton('Submit')}
            <Link to={`/dashboard/collections/`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default CollectionVersionForm
