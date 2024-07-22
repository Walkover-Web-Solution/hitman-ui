import React from 'react'
import DeleteModal from '../common/deleteModal'

function showDeleteCollectionModal(props, onHide, title, message, selectedCollection) {
  return <DeleteModal {...props} show onHide={onHide} title={title} message={message} deleted_collection={selectedCollection} />
}

export default {
  showDeleteCollectionModal
}
