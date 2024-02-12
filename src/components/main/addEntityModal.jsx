import React, { Component } from 'react'
import { Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import extractCollectionInfoService from '../publishDocs/extractCollectionInfoService'
import './addEntity/addEntity.scss'

const versionMessage = 'Please add a version first'
const groupMessage = 'Please add group first'
const versionAndGroupMessage = 'Please add version and group first'

class AddEntitySelectionModal extends Component {
  state = {}

  componentDidMount() {
    const versions = extractCollectionInfoService.extractVersionsFromCollectionId(this.props.collectionId, this.props)
    const groups = extractCollectionInfoService.extractGroupsFromVersions(versions, this.props)
    this.setState({ versions, groups })
  }

  checkAvailability(entity) {
    if (this.state.versions && this.state.groups) {
      if (entity === 'page' && Object.keys(this.state.versions).length === 0) {
        return versionMessage
      } else if (entity === 'endpoint') {
        if (Object.keys(this.state.versions).length === 0) {
          return versionAndGroupMessage
        } else if (Object.keys(this.state.groups).length === 0) {
          return groupMessage
        }
      }
      return false
    }
  }

  renderEntity(entity) {
    if (!this.checkAvailability(entity) || entity === 'version') {
      return (
        <button className='entity-name' onClick={() => this.props.openAddEntityModal(entity)}>
          {entity}
        </button>
      )
    } else {
      return (
        <OverlayTrigger placement='top' overlay={<Tooltip id={entity}>{this.checkAvailability(entity)}</Tooltip>}>
          <button className='entity-name'>{entity}</button>
        </OverlayTrigger>
      )
    }
  }

  render() {
    return (
      <Modal
        show={this.props.show}
        onHide={this.props.onHide}
        size='lg'
        animation={false}
        aria-labelledby='contained-modal-title-vcenter'
        centered
        dialogClassName='add-entity-modal-container'
      >
        <Modal.Header className='custom-collection-modal-container' closeButton>
          <Modal.Title id='contained-modal-title-vcenter'>{this.props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='body'>
            <div className='col'>
              <div className='row justify-content-around'>{this.renderEntity('version')}</div>
              <div className='row justify-content-around'>
                {this.renderEntity('endpoint')}
                {this.renderEntity('page')}
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    )
  }
}

export default AddEntitySelectionModal
