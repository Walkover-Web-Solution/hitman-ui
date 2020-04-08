import React, { Component } from "react";

class BodyDescription extends Component {
  state = {};
  render() {
    return (
      <div>
        <h1>BodyDescription</h1>
        <textarea
          className="form-control"
          name="raw"
          id="body"
          rows="8"
          //   onChange={this.handleChange}
          //   value={this.state.data.raw}
        />
      </div>
    );
  }
}

export default BodyDescription;
