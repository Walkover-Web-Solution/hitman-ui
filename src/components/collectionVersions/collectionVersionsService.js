import React from 'react'
import DeleteModal from '../common/deleteModal'
import ParentPageForm from './parentPageForm'

function showParentPageForm (props, onHide, collectionId, title) {
  return (
    <ParentPageForm
      {...props}
      show
      onHide={onHide}
      collection_id={collectionId}
      title={title}
    />
  )
}

function showDeleteVersionModal (props, onHide, title, message, selectedVersion) {
  return (
    <DeleteModal
      {...props}
      show
      onHide={onHide}
      title={title}
      message={message}
      deleted_version={selectedVersion}
    />
  )
}

export default { showParentPageForm, showDeleteVersionModal }
