import React from "react";
import DeleteModal from "../common/deleteModal";

function showDeleteEndpointModal(props,handleDelete, onHide, title, selectedEndpoint) {
  return (
    <DeleteModal
      {...props}
      handle_delete = {handleDelete}
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
