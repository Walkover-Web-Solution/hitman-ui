import React, { Component } from "react";
import { Link } from "react-router-dom";

class Home extends Component {
  render() {
    return (
      <React.Fragment>
        <h1>Welcome To Hitman</h1>
        <button className="btn btn-success btn-lg">
          <Link to="/login">Go To Login</Link>
        </button>
      </React.Fragment>
    );
  }
}

export default Home;
