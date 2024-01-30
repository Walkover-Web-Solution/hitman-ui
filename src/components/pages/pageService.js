import React from 'react'
import DeleteModal from '../common/deleteModal'

function showDeletePageModal(props, onHide, title, message, selectedPage) {
  debugger
  console.log("inside show delete page modal", selectedPage);
  return <DeleteModal {...props} show onHide={onHide} title={title} message={message} deleted_page={selectedPage} />
}

export default {
  showDeletePageModal
}
