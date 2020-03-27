import React, { Component } from "react";
import { Modal, ListGroup, Container, Row, Col } from "react-bootstrap";
var HTTPSnippet = require("httpsnippet");
// var ScrollArea = require("react-scrollbar/no-css");

class CodeWindow extends Component {
  state = {};

  makeCodeSnippet() {
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
    return snippet;
  }

  makeCodeTemplate(selectedLanguage) {
    let snippet = this.makeCodeSnippet();
    let codeSnippet = snippet.convert(selectedLanguage);
    this.setState({ codeSnippet });
  }
  languages = {
    node: { name: "Node" },
    shell: { name: "Shell" },
    c: { name: "C" },
    csharp: { name: "Csharp" },
    javascript: { name: "JavaScript" },
    php: { name: "PHP" },
    r: { name: "R" },
    ruby: { name: "Ruby" },
    swift: { name: "Swift" },
    java: { name: "JAVA" },
    clojure: { name: "Clojure" },
    go: { name: "go" },
    htpp: { name: "http" },
    objc: { name: "objc" },
    ocaml: { name: "ocaml" },
    python: { name: "Python" }
  };

  render() {
    if (!this.state.codeSnippet) {
      let snippet = this.makeCodeSnippet();
      this.codeSnippet = snippet.convert("node");
    }
    return (
      <div>
        <Modal
          {...this.props}
          id="modal-code-window"
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
            {/* <ScrollArea
              speed={0.8}
              className="area"
              contentClassName="content"
              horizontal={false}
            >
              {() => <div>Some long content. </div>} */}
            <Container>
              <Row>
                <Col sm={3} id="code-window-sidebar">
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
                </Col>
                <Col sm={7}>
                  {" "}
                  <pre>
                    {this.state.codeSnippet
                      ? this.state.codeSnippet
                      : this.codeSnippet}
                  </pre>
                </Col>
              </Row>
            </Container>
            {/* </ScrollArea> */}
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default CodeWindow;
