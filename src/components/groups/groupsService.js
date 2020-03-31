import React from "react";
import DeleteModal from "../common/deleteModal";

function showDeleteGroupModal(props, onHide, title, selectedGroup) {
  return (
    <DeleteModal
      {...props}
      show={true}
      onHide={onHide}
      title={title}
      deleted_group={selectedGroup}
    />
  );
}

export default {
  showDeleteGroupModal
};
