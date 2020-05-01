import "ace-builds";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-github";
import "ace-builds/webpack-resolver";
import React, { Component } from "react";
import AceEditor from "react-ace";
import { Button } from "react-bootstrap";
import BodyDescription from "./bodyDescription";
import "./endpoints.scss";
import GenericTable from "./genericTable";

class BodyContainer extends Component {
  state = {
    selectedBodyType: null,
    data: {
      raw: "",
      data: [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: "",
        },
      ],
      urlencoded: [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: "",
        },
      ],
    },
    endpointId: null,
    selectedRawBodyType: "TEXT",

    // updatedArray: {},
  };

  rawBodyTypes = ["TEXT", "HTML", "JSON", "XML", "JavaScript"];

  handleSelectBodyType(bodyType, bodyDescription) {
    console.log(bodyType);
    switch (bodyType) {
      case "multipart/form-data":
        this.props.set_body(bodyType, this.state.data.data);
        break;
      case "application/x-www-form-urlencoded":
        this.props.set_body(bodyType, this.state.data.urlencoded);
    }
    if (bodyType === "raw" && bodyDescription) {
      this.flag = true;
      this.showRawBodyType = true;
      this.setState({
        selectedBodyType: this.state.selectedRawBodyType,
      });
      this.props.set_body(
        this.state.selectedRawBodyType,
        this.state.data[bodyType]
      );
    } else {
      this.flag = false;
      if (bodyType === "raw") {
        this.showRawBodyType = true;
        this.setState({
          selectedBodyType: this.state.selectedRawBodyType,
        });
        this.props.set_body(
          this.state.selectedRawBodyType,
          this.state.data[bodyType]
        );
      } else {
        this.showRawBodyType = false;
        this.setState({
          selectedBodyType: bodyType,
        });
      }
    }
  }

  handleChange(value) {
    const data = { ...this.state.data };
    data.raw = value;
    this.setState({ data });
    this.props.set_body(this.state.selectedRawBodyType, value);
  }

  handleChangeBody(title, dataArray) {
    const data = { ...this.state.data };
    switch (title) {
      case "formData":
        data.data = dataArray;
        this.setState({ data });
        this.props.set_body(this.state.selectedBodyType, dataArray);
        break;
      case "x-www-form-urlencoded":
        data.urlencoded = dataArray;
        this.setState({ data });
        this.props.set_body(this.state.selectedBodyType, dataArray);
        break;
      default:
        break;
    }
  }

  setRawBodyType(rawBodyType) {
    this.setState({
      selectedRawBodyType: rawBodyType,
      selectedBodyType: rawBodyType,
    });
    this.props.set_body(rawBodyType, this.state.data.raw);
  }

  renderBody() {
    if (this.state.selectedBodyType && this.flag) {
      return (
        <BodyDescription
          {...this.props}
          body={this.state.data.raw}
          body_type={this.state.selectedRawBodyType}
        />
      );
    } else if (this.state.selectedBodyType) {
      switch (this.state.selectedBodyType) {
        case "multipart/form-data":
          return (
            <GenericTable
              {...this.props}
              title="formData"
              dataArray={[...this.state.data.data]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.state.data.data]}
              count="1"
            ></GenericTable>
          );
        case "application/x-www-form-urlencoded":
          return (
            <GenericTable
              {...this.props}
              title="x-www-form-urlencoded"
              dataArray={[...this.state.data.urlencoded]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.state.data.urlencoded]}
              count="2"
            ></GenericTable>
          );

        case "none":
          return;
        default:
          return (
            <div>
              {" "}
              <AceEditor
                className="custom-raw-editor"
                mode={this.state.selectedRawBodyType.toLowerCase()}
                theme="github"
                value={this.state.data.raw}
                onChange={this.handleChange.bind(this)}
                setOptions={{
                  showLineNumbers: true,
                }}
                editorProps={{
                  $blockScrolling: false,
                }}
                onLoad={(editor) => {
                  editor.focus();
                  editor.getSession().setUseWrapMode(true);
                  editor.setShowPrintMargin(false);
                }}
              />
            </div>
          );
      }
    }
  }

  render() {
    if (this.props.body !== "" && !this.state.selectedBodyType) {
      let selectedBodyType = this.props.body.type;
      if (
        selectedBodyType === "JSON" ||
        selectedBodyType === "HTML" ||
        selectedBodyType === "JavaScript" ||
        selectedBodyType === "XML" ||
        selectedBodyType === "TEXT"
      ) {
        this.showRawBodyType = true;
        this.rawBodyType = selectedBodyType;
        selectedBodyType = "raw";
      }
      let data = this.state.data;
      let type = selectedBodyType.split("-");
      data[type[type.length - 1]] = this.props.body.value;
      if (
        document.getElementById(selectedBodyType + "-" + this.props.endpoint_id)
      ) {
        document.getElementById(
          selectedBodyType + "-" + this.props.endpoint_id
        ).checked = true;
        this.setState({
          selectedRawBodyType: this.rawBodyType ? this.rawBodyType : "TEXT",
          selectedBodyType,
          data,
        });
      }
    }
    return (
      <div className="body-wrapper">
        <form className="body-select d-flex ">
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`none-${this.props.endpoint_id}`}
              defaultChecked={!this.state.selectedBodyType ? true : false}
              onClick={() => this.handleSelectBodyType("none")}
              className="custom-radio-input"
            />
            none
          </label>
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`raw-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("raw")}
              className="custom-radio-input"
            />
            raw
          </label>
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`multipart/form-data-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("multipart/form-data")}
              className="custom-radio-input"
            />
            form-data
          </label>
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`application/x-www-form-urlencoded-${this.props.endpoint_id}`}
              onClick={() =>
                this.handleSelectBodyType("application/x-www-form-urlencoded")
              }
              className="custom-radio-input"
            />
            x-www-form-urlencoded
          </label>

          <div className="body">
            {this.showRawBodyType === true && (
              <div>
                <div className="dropdown">
                  <button
                    style={{ color: "tomato", paddingTop: "0px" }}
                    className="btn dropdown-toggle flex-column"
                    type="button"
                    id="dropdownMenuButton"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    {this.state.selectedRawBodyType}
                  </button>
                  <div
                    className="dropdown-menu"
                    aria-labelledby="dropdownMenuButton"
                  >
                    {this.rawBodyTypes.map((rawBodyType) => (
                      <button
                        className="btn custom-body-type-button"
                        type="button"
                        onClick={() => this.setRawBodyType(rawBodyType)}
                        key={rawBodyType}
                      >
                        {rawBodyType}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </form>
        {this.showRawBodyType === true && (
          <Button
            type="button"
            name={`body-select-${this.props.endpoint_id}`}
            id={`body-description-${this.props.endpoint_id}`}
            onClick={() => this.handleSelectBodyType("raw", "bodyDescription")}
            className="custom-body-description"
          >
            Body Description
          </Button>
        )}
        <div className="body-container">{this.renderBody()}</div>
      </div>
    );
  }
}

export default BodyContainer;
