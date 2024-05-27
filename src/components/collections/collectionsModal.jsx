import React, { Component } from "react"
import CollectionForm from "./collectionForm"
import OpenApiForm from "../openApi/openApiForm"
import { Modal } from "react-bootstrap"
import "./collectionsModal.scss"

const collectionsModalEnum = {
  IMPORT: "import",
  NEW: "new"
}

const choices = {
  [collectionsModalEnum.IMPORT]: {
    key: collectionsModalEnum.IMPORT,
    label: "Import",
    modalTitle: "Import Collection",
    modalSize: "sm",
    disabled: false
  },
  [collectionsModalEnum.NEW]: {
    key: collectionsModalEnum.NEW,
    label: "Create New",
    disabled: false,
    modalTitle: "Create New Collection",
    modalSize: "sm",
    id: "add_collection_create_new_btn"
  }
}

class CollectionsModal extends Component {
  state = {
    choiceSelected: null
  }

  selectChoice(choice) {
    this.setState({ choiceSelected: choice })
  }

  renderChoices() {
    return (
      <div className='d-flex justify-content-center'>
        {Object.values(choices).map((choice) => (
          <div key={choice.key} className={["add-collection-item", choice.disabled ? "disabled" : ""].join(" ")} onClick={() => (choice.disabled ? {} : this.selectChoice(choice.key))}>
            <div>
              <span>{choice.label}</span>
              <br />
              <small>{choice.sublabel}</small>
            </div>
          </div>
        ))}
      </div>
    )
  }

  renderSelectedForm() {
    switch (this.state.choiceSelected) {
      case collectionsModalEnum.IMPORT:
        return this.renderImportForm()
      case collectionsModalEnum.NEW:
        return this.renderAddCollectionForm()
      default:
        return null
    }
  }

  removeSelection() {
    this.setState({ choiceSelected: null })
  }

  renderAddCollectionForm() {
    return (
      <CollectionForm
        {...this.props}
        title='Add new Collection'
        showOnlyForm
        onCancel={() => {
          this.removeSelection()
        }}
        onHide={() => {
          this.props.onHide()
        }}
      />
    )
  }

  renderImportForm() {
    return (
      <OpenApiForm
        showOnlyForm
        onCancel={() => {
          this.removeSelection()
        }}
        onHide={() => {
          this.props.onHide()
        }}
      />
    )
  }

  render() {
    /** Get Current Choice Selection */
    const selectedChoice = choices[this.state.choiceSelected]

    /** Set Default values */
    let dialogClassName = "collection-choice-modal"
    let modalSize = "sm"
    let modalTitle = this.props.title
    let modalBody = this.renderChoices()

    if (selectedChoice) {
      dialogClassName = ""
      modalSize = selectedChoice.modalSize
      modalTitle = selectedChoice.modalTitle
      modalBody = this.renderSelectedForm()
    }

    return (
      <Modal size={modalSize} onHide={this.props.onHide} show={this.props.show} dialogClassName={dialogClassName}>
        <div>
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>{modalBody}</Modal.Body>
        </div>
      </Modal>
    )
  }
}

export default CollectionsModal
