import React, { Component } from "react";
import GenericTable from "./genericTable";

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
  };

  handleSelectBodyType(bodyType) {
    this.setState({
      selectedBodyType: bodyType,
    });
    this.props.set_body(bodyType, this.state.data[bodyType]);
  }

  handleChange = (e) => {
    const data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
    this.props.set_body(this.state.selectedBodyType, e.currentTarget.value);
  };

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

  renderBody() {
    switch (this.state.selectedBodyType) {
      case "raw":
        return (
          <textarea
            className="form-control"
            name="raw"
            id="body"
            rows="8"
            onChange={this.handleChange}
            value={this.state.data.raw}
          />
        );
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
        return <div></div>;
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
        <form className="body-select custom-body-form">
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
        </form>

        <div className="body-container">{this.renderBody()}</div>
      </div>
    );
  }
}

export default BodyContainer;
