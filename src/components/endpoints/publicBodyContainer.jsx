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

  render() {
    console.log(this.props);
    if (this.props.body && this.props.body.type === "JSON") {
      this.dataArray = [];
      const jsonData = JSON.parse(this.props.body.value);
      console.log(jsonData);
      const keysArray = Object.keys(jsonData);
      console.log(typeof jsonData[keysArray[1]]);
      let i;
      for (i in keysArray) {
        // let thing = new JSONObject(jsonData).get(keysArray[i]);
        // let classNameOfThing = thing.getClass().getName();
        // console.log("thing is a ", classNameOfThing);
        // if (thing instanceof Integer) {
        //   System.out.println("thing is an Integer");
        // }
        const json = {
          key: keysArray[i],
          value: jsonData[keysArray[i]],
          dataType: typeof jsonData[keysArray[i]],
        };
        this.dataArray.push(json);
      }

      console.log(this.dataArray);
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
                      style={{ "margin-left": "5px" }}
                    ></td>
                    <td className="custom-td">
                      <input
                        disabled
                        name={index + ".key"}
                        value={this.dataArray[index].key}
                        onChange={this.handleChange}
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
