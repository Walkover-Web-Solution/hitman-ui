import React, { Component } from "react";

class DisplayPage extends Component {
  state = {};
  render() {
    console.log(this.props);
    return (
      <div>
        <h1>hh111</h1>
        <h1>{this.props.location.page.id}</h1>
        <h1>{this.props.location.page.name}</h1>
      </div>
    );
  }
}

export default DisplayPage;
