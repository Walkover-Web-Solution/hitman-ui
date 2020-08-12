// import image from "../common/Screenshot 2020-03-21 at 10.53.24 AM.png";
import { ReactComponent as EmptyResponseImg } from "./img/empty-response.svg";
import React, { Component } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import JSONPretty from "react-json-pretty";
import "./endpoints.scss";
import { isDashboardRoute } from "../common/utility";
var JSONPrettyMon = require("react-json-pretty/dist/monikai");

class SampleResponse extends Component {
  state = {
    rawResponse: false,
    prettyResponse: true,
    previewResponse: false,
    responseString: "",
    timeElapsed: "",
    // openBody: false,
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
      responseString: JSON.stringify(this.props.response.data),
    });
  }

  prettyDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: false,
      prettyResponse: true,
      responseString: JSON.stringify(this.props.response),
    });
  }

  previewDataResponse() {
    this.setState({
      rawResponse: false,
      previewResponse: true,
      prettyResponse: false,
    });
  }

  //   openBody() {
  //     this.setState({ openBody: true });
  //   }

  //   closeBody() {
  //     this.setState({ openBody: false });
  //   }

  render() {
    const sampleResponseArray = [...this.props.sample_response_array];
    const sampleResponseFlagArray = [...this.props.sample_response_flag_array];
    return (
      <div id="sample-response">
        {sampleResponseArray.map((obj, index) => (
          <div key={index} className="sample-response-item">
            <span className="sample-response-edit">
              <i class="fas fa-edit"></i>
            </span>
            <div className="response-item-status">status : {obj.status}</div>
            <div className="response-item-description">
              descripton : {obj.description || "No descrption"}
            </div>
            <div className="response-item-body">
              body :{" "}
              {!sampleResponseFlagArray[index] && (
                <i
                  class="fa fa-caret-right"
                  aria-hidden="true"
                  onClick={() => this.props.open_body(index)}
                ></i>
              )}
              {sampleResponseFlagArray[index] && (
                <React.Fragment>
                  <i
                    class="fa fa-caret-down"
                    aria-hidden="true"
                    onClick={() => this.props.close_body(index)}
                  ></i>

                  <JSONPretty
                    theme={JSONPrettyMon}
                    data={this.props.response.data}
                  />
                </React.Fragment>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
}

export default SampleResponse;
