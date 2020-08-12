// import image from "../common/Screenshot 2020-03-21 at 10.53.24 AM.png";
import { ReactComponent as EmptyResponseImg } from "./img/empty-response.svg";
import React, { Component } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import JSONPretty from "react-json-pretty";
import "./endpoints.scss";
import SampleResponseForm from "./sampleResponseForm";

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

  openSampleResponseForm(obj, index) {
    this.setState({
      showSampleResponseForm: true,
      sampleResponseFormName: "Edit Sample Response",
      selectedSampleResponse: {
        ...obj,
      },
    });
  }

  showSampleResponseForm() {
    return (
      this.state.showSampleResponseForm && (
        <SampleResponseForm
          {...this.props}
          show={true}
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          selectedSampleResponse={this.state.selectedSampleResponse}
        />
      )
    );
  }

  closeForm() {
    this.setState({ showSampleResponseForm: false });
  }

  render() {
    const sampleResponseArray = [...this.props.sample_response_array];
    const sampleResponseFlagArray = [...this.props.sample_response_flag_array];
    console.log(sampleResponseArray);
    return (
      <div id="sample-response">
        {this.showSampleResponseForm()}
        {sampleResponseArray.map((obj, index) => (
          <div key={index} className="sample-response-item">
            <span
              className="sample-response-edit"
              onClick={() => this.openSampleResponseForm(obj, index)}
            >
              <i className="fas fa-pen"></i>
            </span>
            <div className="response-item-status">Status : {obj.status}</div>
            <div className="response-item-description">
              Description : {obj.description || ""}
            </div>
            <div className="response-item-body">
              Body :{" "}
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
                    // theme={JSONPrettyMon}
                    themeClassName="custom-json-pretty"
                    data={obj.data}
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
