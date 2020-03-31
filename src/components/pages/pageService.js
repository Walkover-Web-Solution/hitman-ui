import React from "react";
import DeleteModal from "../common/deleteModal";

function showDeletePageModal(props, onHide, title,message, selectedPage) {
  return (
    <DeleteModal
      {...props}
      show={true}
      onHide={onHide}
      title={title}
      message ={message}
      deleted_page={selectedPage}
    />
  );
}

export default {
  showDeletePageModal
};
