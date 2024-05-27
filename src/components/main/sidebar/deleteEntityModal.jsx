import React, { Component, createRef } from "react"
import { Modal } from "react-bootstrap"

import { closeModal } from "../../modals/redux/modalsActions"
import { DELETE_CONFIRMATION } from "../../modals/modalTypes"
import { connect } from "react-redux"
import confirmationModalEnum from "../../common/confirmationModalEnum"
import { withRouter } from "react-router"

const mapDispatchToProps = (dispatch) => {
  return {
    close_modal: () => dispatch(closeModal())
  }
}

const mapStateToProps = (state) => {
  return {
    modals: state.modals,
    collections: state.collections,
    versions: state.versions,
    groups: state.groups,
    pages: state.pages,
    endpoints: state.endpoints
  }
}

class DeleteSidebarEntityModal extends Component {
  constructor(props) {
    super(props)
    this.state = {}
    this.submitButton = createRef()
  }

  handleSubmit(e) {
    e.preventDefault()
    this.props.close_modal()
  }

  onHide = () => {
    this.props.close_modal()
  }

  componentDidMount() {
    this.submitButton.current.focus()
  }

  getModalData = () => {
    const { collections, sidebar } = this.props
    const { focusedNode } = sidebar
    const { id, type } = sidebar.navList[focusedNode]

    switch (type) {
      case "collections":
        return collections[id].importedFromMarketPlace ? confirmationModalEnum.REMOVE_COLLECTION : confirmationModalEnum.DELETE_COLLECTION
      case "versions":
        return confirmationModalEnum.DELETE_VERSION
      case "groups":
        return confirmationModalEnum.DELETE_GROUP
      case "pages":
        return confirmationModalEnum.DELETE_PAGE
      case "endpoints":
        return confirmationModalEnum.DELETE_ENDPOINT
      default:
        return { title: "", message: "" }
    }
  }

  render() {
    const { title, message } = this.getModalData()
    const { activeModal } = this.props.modals
    return (
      activeModal === DELETE_CONFIRMATION && (
        <Modal show autoFocus backdrop='static' centered onHide={() => this.onHide}>
          <Modal.Header className='custom-collection-modal-container' closeButton>
            <Modal.Title id='contained-modal-title-vcenter'>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body id='custom-delete-modal-body'>
            {message}
            <form onSubmit={this.handleSubmit.bind(this)}>
              <button ref={this.submitButton} type='submit' id='custom-delete-modal-delete' className='btn btn-danger btn-lg mr-2'>
                {title === "Remove Collection" ? "Remove" : "Delete"}
              </button>
              <button id='custom-delete-modal-cancel' className='btn btn-secondary outline btn-lg' onClick={() => this.onHide}>
                Cancel
              </button>
            </form>
          </Modal.Body>
        </Modal>
      )
    )
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DeleteSidebarEntityModal))
