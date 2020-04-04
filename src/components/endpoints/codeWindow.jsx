import React, { Component } from "react";
import { Modal, ListGroup, Container, Row, Col } from "react-bootstrap";
import Highlight from "react-highlight";
import "../../../node_modules/highlight.js/styles/vs.css";
import { CopyToClipboard } from "react-copy-to-clipboard";
var HTTPSnippet = require("httpsnippet");

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
    this.selectedLanguage = selectedLanguage;
    this.selectedLanguageName = this.languages[selectedLanguage].name;
    let snippet = this.makeCodeSnippet();
    let codeSnippet = snippet.convert(selectedLanguage);
    this.setState({ codeSnippet, copied: false });
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
      this.selectedLanguage = "node";
      this.selectedLanguageName = this.languages["node"].name;
      this.codeSnippet = snippet.convert("node");
    }
    return (
      <div>
        <Modal
          {...this.props}
          id="modal-code-window"
          size="lg"
          animation={false}
          aria-labelledby="contained-modal-title-vcenter"
          centered
        >
          <Modal.Header
            className="custom-collection-modal-container"
            closeButton
          >
            <Modal.Title id="contained-modal-title-vcenter">
              {this.props.title}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body>
<<<<<<< HEAD
            {/* <ScrollArea
              speed={0.8}
              className="area"
              contentClassName="content"
              horizontal={false}
            >
              {() => <div>Some long content. </div>} */}
            <Container className="d-flex flex-column">
              <Row>
                <Col id="codes" sm={3}>
=======
            <Container className="d-flex flex-column">
              <Row>
                <Col id="code-window-sidebar" sm={3}>
>>>>>>> 183cfbd4173f16c62549cb82810803ad5ca6c12c
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
                  <v1></v1>
                </Col>
                <Col sm={9}>
                  <div id="code-window-body">
                    <div className="code-heading">
                      Generated code for {this.selectedLanguageName}
                    </div>
                    <CopyToClipboard
                      text={
                        this.state.codeSnippet
                          ? this.state.codeSnippet
                          : this.codeSnippet
                      }
                      onCopy={() => this.setState({ copied: true })}
                      id="copy-to-clipboard"
                    >
                      <button>
                        {this.state.copied ? (
                          <i className="fas fa-check"></i>
                        ) : (
                          <i className="fas fa-clone"></i>
                        )}
                      </button>
                    </CopyToClipboard>
                  </div>{" "}
                  <pre>
                    <Highlight className={this.selectedLanguage}>
                      {this.state.codeSnippet
                        ? this.state.codeSnippet
                        : this.codeSnippet}
                    </Highlight>
                  </pre>
                </Col>
              </Row>
            </Container>
          </Modal.Body>
        </Modal>
      </div>
    );
  }
}

export default CodeWindow;
