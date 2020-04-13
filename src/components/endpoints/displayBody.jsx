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
import "./endpoints.scss";
import { Table } from "react-bootstrap";

class BodyContainer extends Component {
  updatedArray = React.createRef();
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
    endpointId: null,
    selectedRawBodyType: "TEXT",

    updatedArray: {},
  };

  rawBodyTypes = ["TEXT", "HTML", "JSON", "XML", "JavaScript"];

  handleAdd(dataType, key) {
    let updatedArray = { ...this.state.updatedArray };
    if (updatedArray[key]) {
      updatedArray[key].push(null);
    } else {
      let tempArr = [null];
      updatedArray[key] = tempArr;
    }
    this.setState({ updatedArray });
  }

  handleDelete(index, key) {
    const updatedArray = { ...this.state.updatedArray };
    updatedArray[key].splice(index, 1);
    this.setState({ updatedArray });
  }

  handleSelectBodyType(bodyType) {
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
      this.props.set_body(bodyType, this.state.data[bodyType]);
    }
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
              {...this.props}
              title="formData"
              dataArray={[...this.state.data.formData]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.state.data.formData]}
              count="1"
            ></GenericTable>
          );
        case "urlEncoded":
          return (
            <GenericTable
              {...this.props}
              title="x-www-form-urlencoded"
              dataArray={[...this.state.data.urlEncoded]}
              handle_change_body_data={this.handleChangeBody.bind(this)}
              original_data={[...this.state.data.urlEncoded]}
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
                style={{
                  width: "1000px",
                }}
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
    if (this.props.body && !this.state.selectedBodyType) {
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
      data[selectedBodyType] = this.props.body.value;
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
        <form className="body-select" className="d-flex ">
          <label class="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`none-${this.props.endpoint_id}`}
              checked={this.state.selectedBodyType === "none" ? true : false}
              onClick={() => this.handleSelectBodyType("none")}
            />
            none
          </label>
          <label class="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`raw-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("raw")}
            />
            raw
          </label>
          <label class="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`formData-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("formData")}
            />
            form-data
          </label>
          <label class="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`urlEncoded-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("urlEncoded")}
            />
            x-www-form-urlencoded
          </label>
          <div class="body">
            {this.showRawBodyType === true && (
              <div className="dropdown">
                <button
                  style={{ color: "#f29624" }}
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
          </div>
        </form>
        <div className="body-container">{this.renderBody()}</div>
      </div>
    );
  }
}

export default BodyContainer;
