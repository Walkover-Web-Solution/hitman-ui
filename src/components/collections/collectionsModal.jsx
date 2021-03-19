import React, { Component } from 'react'
import CollectionForm from './collectionForm'
import OpenApiForm from '../openApi/openApiForm'
import { Modal } from 'react-bootstrap'
import './collectionsModal.scss'

const collectionsModalEnum = {
  IMPORT: 'import',
  NEW: 'new',
  MARKETPLACE: 'marketplace'
}

const choices = {
  [collectionsModalEnum.IMPORT]: {
    key: collectionsModalEnum.IMPORT,
    label: 'Import',
    disabled: false
  },
  [collectionsModalEnum.NEW]: {
    key: collectionsModalEnum.NEW,
    label: 'Create New',
    disabled: false
  },
  [collectionsModalEnum.MARKETPLACE]: {
    key: collectionsModalEnum.MARKETPLACE,
    label: 'Marketplace',
    sublabel: '(Coming Soon)',
    disabled: true
  }
}

class CollectionsModal extends Component {
  state = {
    choiceSelected: null
  }

  selectChoice (choice) {
    this.setState({ choiceSelected: choice })
  }

  renderChoices () {
    return (
      <div className='d-flex justify-content-around'>
        {Object.values(choices).map((choice) => (
          <div
            key={choice.key}
            className={['add-collection-item', choice.disabled && 'disabled'].join(' ')}
            onClick={() => choice.disabled ? {} : this.selectChoice(choice.key)}
          >
            <span>{choice.label}</span><br />
            <small>{choice.sublabel}</small>
          </div>
        ))}
      </div>
    )
  }

  renderSelectedForm () {
    switch (this.state.choiceSelected) {
      case collectionsModalEnum.IMPORT: return this.renderImportForm()
      case collectionsModalEnum.NEW: return this.renderAddCollectionForm()
      case collectionsModalEnum.MARKETPLACE: return this.renderMarketplace()
      default: return null
    }
  }

  removeSelection () { this.setState({ choiceSelected: null }) }

  renderAddCollectionForm () {
    return (
      <CollectionForm
        title='Add new Collection'
        showOnlyForm
        onCancel={() => { this.removeSelection() }}
        onHide={() => { this.props.onHide() }}
      />
    )
  }

  renderImportForm () {
    return (
      <OpenApiForm
        showOnlyForm
        onCancel={() => { this.removeSelection() }}
        onHide={() => { this.props.onHide() }}
      />
    )
  }

  renderMarketplace () {
    return null
  }

  render () {
    return (
      <Modal
        size='lg'
        centered
        onHide={this.props.onHide}
        show={this.props.show}
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
            {this.state.choiceSelected ? this.renderSelectedForm() : this.renderChoices()}
          </Modal.Body>
        </div>
      </Modal>
    )
  }
}

export default CollectionsModal
