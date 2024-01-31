import React from 'react'
import DeleteModal from '../common/deleteModal'
import CollectionVersionForm from './collectionVersionForm'

function showVersionForm(props, onHide, parentPageId, title) {
  return <CollectionVersionForm {...props} show onHide={onHide} parentPage_id={parentPageId} title={title} />
}

function showDeleteVersionModal(props, onHide, title, message, selectedVersion) {
  return <DeleteModal {...props} show onHide={onHide} title={title} message={message} deleted_version={selectedVersion} />
}

export default { showDeleteVersionModal, showVersionForm }
