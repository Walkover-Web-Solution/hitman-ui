import React, { Component } from "react";
import CollectionVersionForm from "../collectionVersions/collectionVersionForm";

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

export default { showVersionForm };
