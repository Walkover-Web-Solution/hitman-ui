import React, { Component } from "react";
import GenericTable from "./genericTable";

class PublicBodyContainer extends Component {
  state = {};

  handleChangeBody(title, dataArray) {
    console.log(title, dataArray);
    switch (title) {
      case "formData":
        this.props.set_body("formData", dataArray);
        break;
      case "x-www-form-urlencoded":
        this.props.set_body("urlEncoded", dataArray);
        break;
      default:
        break;
    }
  }

  handleChange = (e) => {
    const dataArray = [...this.dataArray];
    dataArray[e.currentTarget.name.split(".")[0]].value = e.currentTarget.value;
    let json = {};
    let i;
    for (i in dataArray) {
      json[dataArray[i].key] = dataArray[i].value;
    }
    json = JSON.stringify(json);
    this.props.set_body("JSON", json);
  };

  render() {
    if (this.props.body && this.props.body.type === "JSON") {
      this.dataArray = [];
      const jsonData = JSON.parse(this.props.body.value);
      const keysArray = Object.keys(jsonData);
      let i;
      for (i in keysArray) {
        const json = {
          key: keysArray[i],
          value: jsonData[keysArray[i]],
          dataType: typeof jsonData[keysArray[i]],
        };
        this.dataArray.push(json);
      }
    }
    return (
      <div>
        {this.props.body && this.props.body.type === "formData" && (
          <GenericTable
            {...this.props}
            title={this.props.body.type}
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.body.value]}
          ></GenericTable>
        )}

        {this.props.body && this.props.body.type === "urlEncoded" && (
          <GenericTable
            {...this.props}
            title="x-www-form-urlencoded"
            dataArray={this.props.body.value}
            handle_change_body_data={this.handleChangeBody.bind(this)}
            original_data={[...this.props.body.value]}
          ></GenericTable>
        )}

        {this.props.body && this.props.body.type === "JSON" && (
          <div className="generic-table-container">
            <div className="public-generic-table-title-container">Body</div>
            <table className="table table-bordered" id="custom-generic-table">
              <thead>
                <tr>
                  <th className="custom-th"> </th>
                  <th className="custom-th" id="generic-table-key-cell">
                    KEY
                  </th>
                  <th className="custom-th">VALUE</th>
                  <th className="custom-th">DATATYPE</th>
                </tr>
              </thead>
              <tbody style={{ border: "none" }}>
                {this.dataArray.map((e, index) => (
                  <tr key={index} id="generic-table-row">
                    <td
                      className="custom-td"
                      id="generic-table-key-cell"
                      style={{ marginLeft: "5px" }}
                    ></td>
                    <td className="custom-td">
                      <input
                        disabled
                        name={index + ".key"}
                        value={this.dataArray[index].key}
                        type={"text"}
                        placeholder={
                          this.dataArray[index].checked === "notApplicable"
                            ? "Key"
                            : ""
                        }
                        className="form-control"
                        style={{ border: "none" }}
                      ></input>
                    </td>
                    <td className="custom-td">
                      <input
                        name={index + ".value"}
                        value={this.dataArray[index].value}
                        onChange={this.handleChange}
                        type={"text"}
                        placeholder="Value"
                        className="form-control"
                        style={{ border: "none" }}
                      />
                    </td>
                    <td className="custom-td">
                      <input
                        disabled
                        name={index + ".datatype"}
                        type={"text"}
                        value={this.dataArray[index].dataType}
                        placeholder="DataType"
                        className="form-control"
                        style={{ border: "none" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
}

export default PublicBodyContainer;
