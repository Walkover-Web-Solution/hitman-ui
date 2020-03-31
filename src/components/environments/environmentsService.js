import React from "react";
import EnvironmentVariables from "./environmentVariables";
import DeleteModal from "../common/deleteModal";

function showEnvironmentForm(props, onHide, title, environment) {
  return (
    <EnvironmentVariables
      {...props}
      show={true}
      onHide={onHide}
      title={title}
      environment={environment}
    />
  );
}

function showDeleteEnvironmentModal(props, onHide, title, selectedEnvironment) {
  return (
    <DeleteModal
      {...props}
      show={true}
      onHide={onHide}
      title={title}
      deleted_environment={selectedEnvironment}
    />
  );
}

export default {
  showEnvironmentForm,
  showDeleteEnvironmentModal
};
