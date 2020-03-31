import React from "react";
import DeleteModal from "../common/deleteModal";

function showDeletePageModal(props, onHide, title, selectedPage) {
  return (
    <DeleteModal
      {...props}
      show={true}
      onHide={onHide}
      title={title}
      deleted_page={selectedPage}
    />
  );
}

export default {
  showDeletePageModal
};
