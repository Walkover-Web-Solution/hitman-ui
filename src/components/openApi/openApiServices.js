import React from "react";
import openApiForm from "../openApi/openApiForm"
function showOpenApiForm(props, onHide, title) {
    return (
      <openApiForm
        {...props}
        show={true}
        onHide={onHide}
        title={title}
      />
    );
  }
  export default {
    showOpenApiForm
  };