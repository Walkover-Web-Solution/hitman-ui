import React, { Component } from "react";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";
import { CopyToClipboard } from "react-copy-to-clipboard";
import JSONPretty from "react-json-pretty";
const status = require("http-status");
var JSONPrettyMon = require("react-json-pretty/dist/monikai");

class DisplayResponse extends Component {
  state = {
    rawResponse: false,
    prettyResponse: true,
    previewResponse: false,
    responseString: "",
    timeElapsed: ""
  };

  responseTime() {
    let timeElapsed = this.props.timeElapsed;
    this.setState({ timeElapsed });
  }

  rawDataResponse() {
    this.setState({
      rawResponse: true,
      previewResponse: false,
      prettyResponse: false,
      responseString: JSON.stringify(this.props.response.data)
    });
  }

  prettyDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: false,
      prettyResponse: true,
      responseString: JSON.stringify(this.props.response)
    });
  }

  previewDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: true,
      prettyResponse: false
    });
  }

  render() {
    return (
      <div>
        {this.props.response.status ? (
          this.props.response.status === 200 ? (
            <div>
              <div className="alert alert-success" role="alert">
                Status :{" "}
                {this.props.response.status +
                  " " +
                  this.props.response.statusText}
                <div style={{ float: "right" }}>
                  Time:{this.props.timeElapsed}ms
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger" role="alert">
              Status :
              {this.props.response.status +
                " " +
                status[this.props.response.status]}
            </div>
          )
        ) : null}

        {this.props.flagResponse === true &&
        (this.state.prettyResponse === true ||
          this.state.rawResponse === true ||
          this.state.previewResponse === true) ? (
          <div>
            <div>
              <Navbar bg="primary" variant="dark">
                <Navbar.Brand href="#home" />
                <Nav className="mr-auto">
                  <Nav.Link onClick={this.prettyDataResponse.bind(this)}>
                    Pretty
                  </Nav.Link>
                  <Nav.Link onClick={this.rawDataResponse.bind(this)}>
                    Raw
                  </Nav.Link>
                  <Nav.Link onClick={this.previewDataResponse.bind(this)}>
                    Preview
                  </Nav.Link>
                </Nav>
                <CopyToClipboard
                  text={JSON.stringify(this.props.response.data)}
                  onCopy={() => this.setState({ copied: true })}
                  style={{ float: "right", borderRadius: "12px" }}
                >
                  <button style={{ borderRadius: "12px" }}>Copy</button>
                </CopyToClipboard>
              </Navbar>
            </div>

            {this.state.prettyResponse === true ? (
              <div>
                <JSONPretty
                  theme={JSONPrettyMon}
                  data={this.props.response.data}
                />
              </div>
            ) : null}
            {this.state.rawResponse === true ? (
              <div style={{ display: "block", whiteSpace: "normal" }}>
                {this.state.responseString}
              </div>
            ) : null}
            {this.state.previewResponse === true ? (
              <div style={{ display: "block", whiteSpace: "normal" }}>
                feature coming soon
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }
}

export default DisplayResponse;
