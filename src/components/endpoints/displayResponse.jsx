// import image from "../common/Screenshot 2020-03-21 at 10.53.24 AM.png";
import React, { Component } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import JSONPretty from "react-json-pretty";
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
                  <button>
                    <i class="fas fa-clone"></i>
                  </button>
                </CopyToClipboard>
              </div>
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
            </div>
          </React.Fragment>
        ) : (
          <div>
            <div className="empty-response">Response</div>
            <div className="empty-response-container">
              <div className="empty-response-container-2">
                <div className="empty-response-container-3">
                  {/* <img src={image} height="100px" width="100px" alt="" /> */}
                  {/* <p>esdfsf</p> */}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default DisplayResponse;
