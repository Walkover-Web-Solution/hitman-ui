import React, { Component } from "react";
import GenericTable from "./genericTable";

class Body extends Component {
  state = {
    selectedBodyType: ""
  };

  handleChange = e => {
    if (e.currentTarget.name === "bodyType") {
      this.setState({ selectedBodyType: e.currentTarget.value });
      this.props.props_from_parent("selectedBodyType", e.currentTarget.value);
    }
    if (e.currentTarget.name === "rawBody") {
      this.props.props_from_parent("rawBody", e.currentTarget.value);
    }
  };

  render() {
    const {
      rawBody,
      urlencodedBody,
      formdataBody,
      selectedBodyType
    } = this.props;
    return (
      <div>
        <div
          style={{
            padding: "5px 10px",
            display: "flex",
            flexDirection: "row"
          }}
        >
          <span>
            <label>
              <input
                name="bodyType"
                value={null}
                onChange={this.handleChange}
                type="radio"
              ></input>{" "}
              none
            </label>
            <label>
              <input
                name="bodyType"
                value="rawBody"
                onChange={this.handleChange}
                type="radio"
              ></input>
              raw{" "}
            </label>
            <label>
              <input
                name="bodyType"
                value="formdataBody"
                onChange={this.handleChange}
                type="radio"
              ></input>
              form-data
            </label>
            <label>
              <input
                name="bodyType"
                value="urlencodedBody"
                onChange={this.handleChange}
                type="radio"
              ></input>{" "}
              x-www-form-urlencoded
            </label>
          </span>
        </div>
        {this.state.selectedBodyType === "rawBody" && (
          <textarea
            className="form-control"
            name="rawBody"
            id="rawbBody"
            rows="8"
            onChange={this.handleChange}
            value={rawBody}
          />
        )}
        {this.state.selectedBodyType === "urlencodedBody" && (
          <GenericTable
            title="x-www-form-urlencoded"
            props_from_parent={this.props.props_from_parent.bind(this)}
            dataArray={urlencodedBody}
          ></GenericTable>
        )}
      </div>
    );
  }
}

export default Body;
