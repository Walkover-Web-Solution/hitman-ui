import React, { Component } from "react";
import CollectionForm from "./collectionForm";

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

export default {
  showCollectionForm
};
