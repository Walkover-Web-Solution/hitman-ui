import React from "react";
import DeleteModal from "../common/deleteModal";

function showDeleteEndpointModal(props, onHide, title, selectedEndpoint) {
  return (
    <DeleteModal
      {...props}
      show={true}
      onHide={onHide}
      title={title}
      deleted_endpoint={selectedEndpoint}
    />
  );
}

export default {
  showDeleteEndpointModal
};
