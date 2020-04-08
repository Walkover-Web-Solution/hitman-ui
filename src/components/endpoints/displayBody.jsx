import React, { Component } from "react";
import GenericTable from "./genericTable";
import Highlight from "react-highlight";
import "../../../node_modules/highlight.js/styles/vs.css";

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
    this.setState({
      selectedBodyType: bodyType,
    });
    console.log("bodyType", bodyType);
    this.props.set_body(bodyType, this.state.data[bodyType]);
  }

  handleChange(e) {
    let selectedBodyType = e.currentTarget.name;
    const data = { ...this.state.data };
    data.raw = e.currentTarget.value;
    console.log("data", data);
    this.setState({ data, selectedBodyType });
    this.props.set_body(selectedBodyType, e.currentTarget.value);
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
      default:
        return (
          <div>
            <Highlight className={this.state.rawBodyType}>
              <textarea
                className="form-control"
                name={this.state.selectedBodyType}
                id="body"
                rows="8"
                onChange={this.handleChange}
                value={this.state.data.raw}
              />
            </Highlight>{" "}
          </div>
        );
    }
  }

  render() {
    if (this.props.body && !this.state.selectedBodyType) {
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
              id="Text"
              onClick={() => this.handleSelectBodyType("TEXT")}
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
          {this.state.selectedBodyType !== "urlEncoded" &&
          this.state.selectedBodyType !== "formData" ? (
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
          ) : null}
        </form>

        <div className="body-container">{this.renderBody()}</div>
      </div>
    );
  }
}

export default BodyContainer;
