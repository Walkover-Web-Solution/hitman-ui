import React from 'react'
import DeleteModal from '../common/deleteModal'

function showDeleteGroupModal(props, onHide, title, message, selectedGroup) {
  return <DeleteModal {...props} show onHide={onHide} title={title} message={message} deleted_page={selectedGroup} />
}

export default {
  showDeleteGroupModal
}
