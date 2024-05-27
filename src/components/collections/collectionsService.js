import React from "react"
import CollectionForm from "./collectionForm"
import DeleteModal from "../common/deleteModal"
import MoveModal from "../common/moveModal/moveModal"

function showCollectionForm(props, onHide, title, selectedCollection) {
  return <CollectionForm {...props} show onHide={onHide} title={title} edited_collection={selectedCollection} />
}

function showDeleteCollectionModal(props, onHide, title, message, selectedCollection) {
  return <DeleteModal {...props} show onHide={onHide} title={title} message={message} deleted_collection={selectedCollection} />
}

function showMoveCollectionModal() {
  return <MoveModal title={"title"} />
}

export default {
  showCollectionForm,
  showDeleteCollectionModal,
  showMoveCollectionModal
}
