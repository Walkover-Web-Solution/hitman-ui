import React, { Component } from "react";
import { Table } from "react-bootstrap";

class DisplayHeaders extends Component {
  state = {
    originalHeaders: []
  };

  handleAddHeader() {
    const len = this.state.originalHeaders.length;
    let originalHeaders = [...this.state.originalHeaders];
    originalHeaders[len.toString()] = {
      key: "",
      value: "",
      description: ""
    };
    this.setState({ originalHeaders });
    this.props.handle_update_headers(originalHeaders);
  }

  handleDeleteHeader(index) {
    let originalHeaders = this.state.originalHeaders;
    let neworiginalHeaders = [];
    for (let i = 0; i < originalHeaders.length; i++) {
      if (i === index) {
        continue;
      }
      neworiginalHeaders.push(this.state.originalHeaders[i]);
    }
    originalHeaders = neworiginalHeaders;
    this.setState({ originalHeaders });
    this.props.handle_update_headers(originalHeaders);
  }

  handleChangeHeader = e => {
    const name = e.currentTarget.name.split(".");
    const originalHeaders = [...this.state.originalHeaders];
    if (name[1] === "key") {
      originalHeaders[name[0]].key = e.currentTarget.value;
    }
    if (name[1] === "value") {
      originalHeaders[name[0]].value = e.currentTarget.value;
    }
    if (name[1] === "description") {
      originalHeaders[name[0]].description = e.currentTarget.value;
    }
    this.setState({ originalHeaders });
    this.props.handle_update_headers(originalHeaders);
  };

  render() {
    if (this.props.location.title == "Add New Endpoint")
      this.setState({ originalHeaders: [] });

    if (this.props.location.endpoint && this.props.location.endpoint.headers) {
      const originalHeaders = [];
      Object.keys(this.props.location.endpoint.headers).map(h => {
        originalHeaders.push(this.props.location.endpoint.headers[h]);
      });
      this.setState({ originalHeaders });
      this.props.handle_update_headers(originalHeaders);
      this.props.history.push({ endpoint: null });
    }
    return (
      <div>
        <Table bordered size="sm">
          <thead>
            <tr>
              <th>KEY</th>
              <th>VALUE</th>
              <th>DESCRIPTION</th>
            </tr>
          </thead>

          <tbody>
            {this.state.originalHeaders.map((header, index) => (
              <tr key={index}>
                <td>
                  <input
                    name={index + ".key"}
                    value={this.state.originalHeaders[index].key}
                    onChange={this.handleChangeHeader}
                    type={"text"}
                    className="form-control"
                    style={{ border: "none" }}
                  />
                </td>
                <td>
                  <input
                    name={index + ".value"}
                    value={this.state.originalHeaders[index].value}
                    onChange={this.handleChangeHeader}
                    type={"text"}
                    className="form-control"
                    style={{ border: "none" }}
                  />
                </td>
                <td>
                  <input
                    name={index + ".description"}
                    value={this.state.originalHeaders[index].description}
                    onChange={this.handleChangeHeader}
                    type={"text"}
                    style={{ border: "none" }}
                    className="form-control"
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="btn btn-light btn-sm btn-block"
                    onClick={() => this.handleDeleteHeader(index)}
                  >
                    x
                  </button>
                </td>
              </tr>
            ))}
            <tr>
              <td> </td>
              <td>
                {" "}
                <button
                  type="button"
                  className="btn btn-link btn-sm btn-block"
                  onClick={() => this.handleAddHeader()}
                >
                  + New Header
                </button>
              </td>
              <td> </td>
              <td> </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}

export default DisplayHeaders;
