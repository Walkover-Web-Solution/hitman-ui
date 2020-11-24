import React from 'react'
import CollectionVersionForm from '../collectionVersions/collectionVersionForm'
import DeleteModal from '../common/deleteModal'

function showVersionForm (props, onHide, collectionId, title) {
  return (
    <CollectionVersionForm
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

export default { showVersionForm, showDeleteVersionModal }
