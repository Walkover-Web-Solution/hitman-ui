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
      raw1: "",
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
    if (updatedArray[key] && Array.isArray(updatedArray[key])) {
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
  handleArrayChange = (e, field, index) => {
    let updatedArray = { ...this.state.updatedArray };
    updatedArray[e.currentTarget.name][index] = e.currentTarget.value;
    let test1 = JSON.stringify(updatedArray);
    this.setState({ updatedArray });
    this.props.set_body(this.state.selectedBodyType, test1);
  };

  handleBodyChange = (e) => {
    let updatedArray = { ...this.state.updatedArray };
    updatedArray[e.currentTarget.name] = e.currentTarget.value;

    let test1 = JSON.stringify(updatedArray);
    this.setState({ updatedArray });
    this.props.set_body(this.state.selectedBodyType, test1);
  };

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
        case "multipart/form-data":
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
        case "application/x-www-form-urlencoded":
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
        case "raw1":
          return (
            <div>
              {this.props.body_description.map((field) =>
                field.dataType.includes("Array") ? (
                  <div>
                    <td>{field.name}</td>
                    <Table bordered size="sm">
                      <tbody>
                        {this.state.updatedArray[field.name] &&
                          Array.isArray(this.state.updatedArray[field.name]) &&
                          this.state.updatedArray[field.name].map(
                            (item, index) =>
                              item !== "deleted" ? (
                                <tr key={index}>
                                  <td>{field.dataType.split(" ")[2]}</td>
                                  <td>
                                    <input
                                      name={field.name}
                                      onChange={(e) =>
                                        this.handleArrayChange(
                                          e,
                                          field.name,
                                          index
                                        )
                                      }
                                      id={field.name}
                                      type={"text"}
                                      style={{ border: "none" }}
                                      className="form-control"
                                    />
                                  </td>

                                  <td>
                                    <button
                                      type="button"
                                      className="btn btn-light btn-sm btn-block"
                                      onClick={() =>
                                        this.handleDelete(index, field.name)
                                      }
                                    >
                                      x{" "}
                                    </button>
                                  </td>
                                </tr>
                              ) : null
                          )}
                        <tr>
                          <td> </td>
                          <td>
                            {" "}
                            <button
                              type="button"
                              className="btn btn-link btn-sm btn-block"
                              onClick={() =>
                                this.handleAdd(field.dataType, field.name)
                              }
                            >
                              + New Item
                            </button>
                          </td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                ) : field !== "deleted" && field.name.trim() !== "" ? (
                  <div className="form-group">
                    <label htmlFor={field.name} className="custom-input-label">
                      {field.name}
                    </label>
                    {field.dataType === "Boolean" && (
                      <select
                        id="custom-select-box"
                        value={null}
                        onChange={(e) => this.handleBodyChange(e)}
                        name={field.name}
                      >
                        <option value={true} key={true}>
                          true
                        </option>
                        <option value={false} key={false}>
                          false
                        </option>
                      </select>
                    )}
                    {field.dataType !== "Boolean" && (
                      <input
                        onChange={this.handleBodyChange}
                        id={field.name}
                        name={field.name}
                        className="form-control custom-input"
                        type={
                          field.dataType === "Integer" ||
                          field.dataType === "Long"
                            ? "number"
                            : "text"
                        }
                        placeholder=""
                      />
                    )}
                  </div>
                ) : null
              )}
            </div>
          );

        case "none":
          return;
        default:
          return (
            <div>
              {" "}
              <AceEditor
                // style={{
                //   width: "1000px",
                // }}
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
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`none-${this.props.endpoint_id}`}
              checked={this.state.selectedBodyType === "none" ? true : false}
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
              id={`raw1-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("raw1")}
              className="custom-radio-input"
            />
            raw1
          </label>
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`formData-${this.props.endpoint_id}`}
              onClick={() => this.handleSelectBodyType("multipart/form-data")}
              className="custom-radio-input"
            />
            form-data
          </label>
          <label className="body">
            <input
              type="radio"
              name={`body-select-${this.props.endpoint_id}`}
              id={`urlEncoded-${this.props.endpoint_id}`}
              onClick={() =>
                this.handleSelectBodyType("application/x-www-form-urlencoded")
              }
              className="custom-radio-input"
            />
            x-www-form-urlencoded
          </label>
          <div className="body">
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
