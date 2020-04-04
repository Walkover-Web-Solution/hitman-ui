import React, { Component } from "react";
import GenericTable from "./genericTable";

class BodyContainer extends Component {
  state = {
    selectedBodyType: null,
    data: {
      raw: "",
      formaData: [
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
  }

  handleChange = (e) => {
    const data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
  };

  handleChangeBody(title, dataArray) {
    switch (title) {
      case "formData":
        const data = { ...this.state.data };
        data.formaData = dataArray;
        this.setState({ data });
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
            dataArray={[...this.state.data.formaData]}
            handle_change_body_data={this.handleChangeBody.bind(this)}
          ></GenericTable>
        );
      default:
        return <div></div>;
    }
  }
  render() {
    return (
      <div className="body-wrapper">
        <form className="body-select">
          <label>
            <input
              type="radio"
              name="body-select"
              value="raw"
              onClick={() => this.handleSelectBodyType("raw")}
            />
            raw
          </label>
          <label>
            <input
              type="radio"
              name="body-select"
              value="form"
              onClick={() => this.handleSelectBodyType("formData")}
            />
            form-data
          </label>
        </form>

        <div className="body-container">{this.renderBody()}</div>
      </div>
    );
  }
}

export default BodyContainer;
