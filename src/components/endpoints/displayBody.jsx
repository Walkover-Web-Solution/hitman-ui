import React, { Component } from "react";
import GenericTable from "./genericTable";
import "ace-builds";
import AceEditor from "react-ace";
import "ace-builds/webpack-resolver";
import "ace-builds/src-noconflict/mode-java";
import "ace-builds/src-noconflict/mode-json";
import "ace-builds/src-noconflict/mode-html";
import "ace-builds/src-noconflict/mode-javascript";
import "ace-builds/src-noconflict/mode-xml";
import "ace-builds/src-noconflict/theme-github";

class BodyContainer extends Component {
  state = {
    selectedBodyType: null,
    data: {
      raw: "",
      formData: [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: "",
        },
      ],
      urlEncoded: [
        {
          checked: "notApplicable",
          key: "",
          value: "",
          description: "",
        },
      ],
    },
    selectedRawBodyType: "TEXT",
  };

  rawBodyTypes = ["TEXT", "HTML", "JSON", "XML", "JavaScript"];

  handleSelectBodyType(bodyType) {
    if (bodyType === "raw") {
      this.showRawBodyType = true;
    } else {
      this.showRawBodyType = false;
    }
    this.setState({
      selectedBodyType: this.state.selectedRawBodyType,
    });
    this.props.set_body(bodyType, this.state.data[bodyType]);
  }

  handleChange(value) {
    console.log(value);
    const data = { ...this.state.data };
    data.raw = value;
    this.setState({ data });
    this.props.set_body(this.state.selectedRawBodyType, value);
  }

  handleChangeBody(title, dataArray) {
    const data = { ...this.state.data };
    switch (title) {
      case "formData":
        data.formData = dataArray;
        this.setState({ data });
        this.props.set_body(this.state.selectedBodyType, dataArray);
        break;
      case "x-www-form-urlencoded":
        data.urlEncoded = dataArray;
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
    if (this.state.selectedBodyType) {
      switch (this.state.selectedBodyType) {
        case "formData":
          return (
            <GenericTable
              title="formData"
              dataArray={[...this.state.data.formData]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              count="1"
            ></GenericTable>
          );
        case "urlEncoded":
          return (
            <GenericTable
              title="x-www-form-urlencoded"
              dataArray={[...this.state.data.urlEncoded]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              count="2"
            ></GenericTable>
          );
        case "none":
          return;
        default:
          return (
            <AceEditor
              mode={this.state.selectedRawBodyType.toLowerCase()}
              theme="github"
              value={this.state.data.raw}
              onChange={this.handleChange.bind(this)}
              showPrintMargin
              showGutter={true}
              highlightActiveLine
              setOptions={{
                showLineNumbers: true,
                tabSize: 2,
              }}
              editorProps={{ $blockScrolling: true }}
            />
          );
      }
    }
  }

  render() {
    if (this.props.body && !this.state.selectedBodyType) {
      console.log("this.props", this.props);
      const selectedBodyType = this.props.body.type;
      let data = this.state.data;
      data[selectedBodyType] = this.props.body.value;
      if (document.getElementById(selectedBodyType)) {
        document.getElementById(selectedBodyType).checked = true;
        this.setState({ selectedBodyType, data });
      }
    }
    return (
      <div className="body-wrapper">
        <form className="body-select">
          <label>
            <input
              type="radio"
              name="body-select"
              id="none"
              checked={this.state.selectedBodyType === "none" ? true : false}
              onClick={() => this.handleSelectBodyType("none")}
            />
            none
          </label>
          <label>
            <input
              type="radio"
              name="body-select"
              id="raw"
              onClick={() => this.handleSelectBodyType("raw")}
            />
            raw
          </label>
          <label>
            <input
              type="radio"
              name="body-select"
              id="formData"
              onClick={() => this.handleSelectBodyType("formData")}
            />
            form-data
          </label>
          <label>
            <input
              type="radio"
              name="body-select"
              id="urlEncoded"
              onClick={() => this.handleSelectBodyType("urlEncoded")}
            />
            urlencoded
          </label>
          {this.showRawBodyType === true && (
            <div className="dropdown">
              <button
                className="btn btn-secondary dropdown-toggle"
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
                    className="btn custom-request-button"
                    type="button"
                    onClick={() => this.setRawBodyType(rawBodyType)}
                    key={rawBodyType}
                  >
                    {rawBodyType}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>

        <div className="body-container">{this.renderBody()}</div>
      </div>
    );
  }
}

export default BodyContainer;
