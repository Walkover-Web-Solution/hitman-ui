import React from 'react'
import DeleteModal from '../common/deleteModal'

function showDeleteGroupModal (props, onHide, title, message, selectedGroup) {
  return (
    <DeleteModal
      {...props}
      show
      onHide={onHide}
      title={title}
      message={message}
      deleted_group={selectedGroup}
    />
  )
}

export default {
  showDeleteGroupModal
}
