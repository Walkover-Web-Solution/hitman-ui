import React, { Component } from "react";
import GenericTable from "./genericTable";
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
    updatedArray: {},
  };

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
    this.setState({
      selectedBodyType: bodyType,
    });
    this.props.set_body(bodyType, this.state.data[bodyType]);
  }

  // handleChange = (e) => {
  //   const data = { ...this.state.data };
  //   data[e.currentTarget.name] = e.currentTarget.value;
  //   this.setState({ data });
  //   this.props.set_body(this.state.selectedBodyType, e.currentTarget.value);
  // };

  handleArrayChange = (e, field, index) => {
    let updatedArray = { ...this.state.updatedArray };
    updatedArray[e.currentTarget.name][index] = e.currentTarget.value;
    console.log(updatedArray);
    let test1 = JSON.stringify(updatedArray);
    this.setState({ updatedArray });
    this.props.set_body(this.state.selectedBodyType, test1);
  };

  handleChange = (e) => {
    let updatedArray = { ...this.state.updatedArray };
    updatedArray[e.currentTarget.name] = e.currentTarget.value;

    let test1 = JSON.stringify(updatedArray);
    this.setState({ updatedArray });
    this.props.set_body(this.state.selectedBodyType, test1);
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
          <div>
            {this.props.body_description.map((field) =>
              field.dataType.includes("Array") ? (
                <div>
                  <td>{field.name}</td>
                  <Table bordered size="sm">
                    <tbody>
                      {this.state.updatedArray[field.name] &&
                        this.state.updatedArray[field.name].map((item, index) =>
                          item !== "deleted" ? (
                            <tr key={index}>
                              <td>{field.dataType.split(" ")[2]}</td>
                              <td>
                                <input
                                  name={field.name}
                                  onChange={(e) =>
                                    this.handleArrayChange(e, field.name, index)
                                  }
                                  id={field.name}
                                  type={"text"}
                                  style={{ border: "none" }}
                                  className="form-control"
                                  placeholder={"name"}
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
                            + New Body param
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
                      onChange={(e) => this.handleChange(e)}
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
                      onChange={this.handleChange}
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
