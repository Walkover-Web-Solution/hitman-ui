import React from "react";
import CollectionForm from "./collectionForm";
import DeleteModal from "../common/deleteModal";

function showCollectionForm(props, onHide, title, selectedCollection) {

  return (
    <CollectionForm
      {...props}
      show={true}
      onHide={onHide}
      title={title}
     
      edited_collection={selectedCollection}
    />
  );
}

function showDeleteCollectionModal(props, onHide, title,message, selectedCollection) {
  return (
    <DeleteModal
      {...props}
      show={true}
      onHide={onHide}
      title={title}
      message = {message}
      deleted_collection={selectedCollection}
    />
  );
}



export default {
  showCollectionForm,
  showDeleteCollectionModal,
  
};
