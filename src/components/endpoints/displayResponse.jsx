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
    console.log(this.props);
    return (
      <div className="endpoint-response-container">
        {this.props.response.status ? (
          <React.Fragment>
            <div className="response-status">
              <div id="status">
                <div className="response-status-item-name">Status :</div>
                <div className="response-status-value">
                  {this.props.response.status +
                    " " +
                    this.props.response.statusText}
                </div>
              </div>
              <div id="time">
                <div className="response-status-item-name">Time:</div>
                <div className="response-status-value">
                  {this.props.timeElapsed}ms
                </div>
              </div>
            </div>
            <div className="response-viewer">
              <div className="response-tabs">
                <ul class="nav nav-tabs" id="myTab" role="tablist">
                  <li class="nav-item">
                    <a
                      class="nav-link active"
                      id="home-tab"
                      data-toggle="tab"
                      href="#home"
                      role="tab"
                      aria-controls="home"
                      aria-selected="true"
                    >
                      Pretty
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      id="profile-tab"
                      data-toggle="tab"
                      href="#profile"
                      role="tab"
                      aria-controls="profile"
                      aria-selected="false"
                    >
                      Raw
                    </a>
                  </li>
                  <li class="nav-item">
                    <a
                      class="nav-link"
                      id="contact-tab"
                      data-toggle="tab"
                      href="#contact"
                      role="tab"
                      aria-controls="contact"
                      aria-selected="false"
                    >
                      Preview
                    </a>
                  </li>
                </ul>

                <CopyToClipboard
                  text={JSON.stringify(this.props.response.data)}
                  onCopy={() => this.setState({ copied: true })}
                  style={{ float: "right", borderRadius: "12px" }}
                >
                  <i class="fas fa-clone"></i>
                </CopyToClipboard>
              </div>
              {/* <div className="response-body"> */}
              <div class="tab-content" id="myTabContent">
                <div
                  class="tab-pane fade show active"
                  id="home"
                  role="tabpanel"
                  aria-labelledby="home-tab"
                >
                  <JSONPretty
                    theme={JSONPrettyMon}
                    data={this.props.response.data}
                  />
                </div>
                <div
                  class="tab-pane fade"
                  id="profile"
                  role="tabpanel"
                  aria-labelledby="profile-tab"
                >
                  {JSON.stringify(this.props.response.data)}
                </div>
                <div
                  class="tab-pane fade"
                  id="contact"
                  role="tabpanel"
                  aria-labelledby="contact-tab"
                >
                  Feature coming soon... Stay tuned
                </div>
              </div>
              {/* </div> */}
            </div>
          </React.Fragment>
        ) : (
          <div className="empty-response">Response</div>
        )}
      </div>
      // <div>
      //   {this.props.response.status ? (
      //     this.props.response.status === 200 ? (
      //       <div>
      //         <div className="alert alert-success" role="alert">
      // Status :{" "}
      // {this.props.response.status +
      //   " " +
      //   this.props.response.statusText}
      //           <div style={{ float: "right" }}>
      //             Time:{this.props.timeElapsed}ms
      //           </div>
      //         </div>
      //       </div>
      //     ) : (
      //       <div className="alert alert-danger" role="alert">
      //         Status :
      //         {this.props.response.status +
      //           " " +
      //           status[this.props.response.status]}
      //       </div>
      //     )
      //   ) : null}

      //   {this.props.flagResponse === true &&
      //   (this.state.prettyResponse === true ||
      //     this.state.rawResponse === true ||
      //     this.state.previewResponse === true) ? (
      //     <div>
      //       <div>
      //         <Navbar bg="primary" variant="dark">
      //           <Navbar.Brand href="#home" />
      //           <Nav className="mr-auto">
      //             <Nav.Link onClick={this.prettyDataResponse.bind(this)}>
      //               Pretty
      //             </Nav.Link>
      //             <Nav.Link onClick={this.rawDataResponse.bind(this)}>
      //               Raw
      //             </Nav.Link>
      //             <Nav.Link onClick={this.previewDataResponse.bind(this)}>
      //               Preview
      //             </Nav.Link>
      //           </Nav>
      //           <CopyToClipboard
      //             text={JSON.stringify(this.props.response.data)}
      //             onCopy={() => this.setState({ copied: true })}
      //             style={{ float: "right", borderRadius: "12px" }}
      //           >
      //             <button style={{ borderRadius: "12px" }}>Copy</button>
      //           </CopyToClipboard>
      //         </Navbar>
      //       </div>

      //       {this.state.prettyResponse === true ? (
      //         <div>
      //           <JSONPretty
      //             theme={JSONPrettyMon}
      //             data={this.props.response.data}
      //           />
      //         </div>
      //       ) : null}
      //       {this.state.rawResponse === true ? (
      //         <div style={{ display: "block", whiteSpace: "normal" }}>
      //           {this.state.responseString}
      //         </div>
      //       ) : null}
      //       {this.state.previewResponse === true ? (
      //         <div style={{ display: "block", whiteSpace: "normal" }}>
      //           feature coming soon
      //         </div>
      //       ) : null}
      //     </div>
      //   ) : null}
      // </div>
    );
  }
}

export default DisplayResponse;

{
  /* <div className="endpoint-response-container">
        <div className="response-status">
          <div id="status">Status: {(200, "OK")}</div>
          <div id="time">Time: {"1442ms"}</div>
        </div>
        <div className="response-viewer">
          <div className="response-tabs"></div>
          <div className="response-body">

        </div>
      </div></div> */
}
