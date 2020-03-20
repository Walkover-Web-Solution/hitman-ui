import React, { Component } from "react";
import EnvironmentVariables from "./environmentVariables";

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
export default {
  showEnvironmentForm
};
