import React, { Component } from "react";
import { Modal, ListGroup } from "react-bootstrap";
var HTTPSnippet = require("httpsnippet");

class CodeWindow extends Component {
  state = {};

  makeCodeTemplate(selectedLanguage) {
    let harObject = this.props.harObject;
    const {
      method,
      url,
      httpVersion,
      cookies,
      headers,
      postData,
      queryString
    } = harObject;
    let snippet = new HTTPSnippet({
      method,
      url,
      httpVersion,
      cookies,
      headers,
      postData,
      queryString
    });
    let codeSnippet = snippet.convert(selectedLanguage);
    this.setState({ codeSnippet });
  }
  languages = {
    node: { name: "Node" },
    shell: { name: "Shell" }
  };

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {/* <nav className="col-md-2 d-none d-md-block bg-light sidebar "> */}
          <div id="template-sidebar" className="sidebar-sticky">
            <ListGroup>
              {Object.keys(this.languages).map(key => (
                <ListGroup.Item
                  onClick={() => {
                    this.makeCodeTemplate(key);
                  }}
                >
                  {this.languages[key].name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
          {/* </nav> */}
          <pre>{this.state.codeSnippet}</pre>
        </Modal.Body>
      </Modal>
    );
  }
}

export default CodeWindow;
