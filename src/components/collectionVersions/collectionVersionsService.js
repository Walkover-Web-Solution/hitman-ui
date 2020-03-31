import React from "react";
import CollectionVersionForm from "../collectionVersions/collectionVersionForm";
import DeleteModal from "../common/deleteModal";

function showVersionForm(props, onHide, collectionId, title) {
  return (
    <CollectionVersionForm
      {...props}
      show={true}
      onHide={onHide}
      collection_id={collectionId}
      title={title}
    />
  );
}

function showDeleteVersionModal(props, onHide, title, selectedVersion) {
  return (
    <DeleteModal
      {...props}
      show={true}
      onHide={onHide}
      title={title}
      deleted_version={selectedVersion}
    />
  );
}

export default { showVersionForm, showDeleteVersionModal };
