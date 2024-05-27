import React from "react"
import EnvironmentVariables from "./environmentVariables"
import DeleteModal from "../common/deleteModal"

function showEnvironmentForm(props, onHide, title, environment) {
  return <EnvironmentVariables {...props} show onHide={onHide} title={title} environment={environment} />
}

function showDeleteEnvironmentModal(props, onHide, title, message, selectedEnvironment) {
  return <DeleteModal {...props} show onHide={onHide} title={title} message={message} deleted_environment={selectedEnvironment} />
}

export default {
  showEnvironmentForm,
  showDeleteEnvironmentModal
}
