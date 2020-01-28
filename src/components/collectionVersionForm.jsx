import React from 'react'
import { Link } from 'react-router-dom'
import { Modal } from 'react-bootstrap'
import Form from './common/form'
import Joi from 'joi-browser'
import collectionversionsservice from '../services/collectionVersionServices'

class CollectionVersionForm extends Form {
  state = {
    data: {
      number: '',
      host: ''
    },
    errors: {},
    editCollectionVersion: true
  }

  schema = {
    number: Joi.string()
      .required()
      .label('Version number'),
    host: Joi.string()
      .required()
      .label('Host')
  }

  async doSubmit (props) {
    this.state.editCollectionVersion = false
    if (this.props.title === 'Edit Collection Version') {
      this.state.data.id = this.props.selectedcollectionversion.id
      this.props.history.push({
        pathname: `/collections`,
        state: {
          newCollectionVersion: { ...this.state.data },
          collectionidentifier: this.props.selectedcollection
            ? this.props.selectedcollection.identifier
            : this.props.collectionidentifier
        }
      })
    }
    if (this.props.title === 'Add new Collection Version') {
      const {
        data: newCollectionVersion
      } = await collectionversionsservice.saveCollectionVersion(
        this.props.collectionIdentifier,
        this.state.data
      )
      this.props.history.push({
        pathname: `/collections`,
        newCollectionVersion: newCollectionVersion,
        collectionidentifier: this.props.collectionIdentifier
      })
    }
  }

  render () {
    console.log(this.props)
    if (
      this.props.editedcollectionversion &&
      this.state.editCollectionVersion
    ) {
      this.state.editCollectionVersion = false
      this.state.data.number = this.props.editedcollectionversion.number
      this.state.data.host = this.props.editedcollectionversion.host
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
            {this.renderInput('number', 'Version Number')}
            {this.renderInput('host', 'Host*')}
            {this.renderButton('Submit')}
            <Link to={`/collections/`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    )
  }
}

export default CollectionVersionForm
