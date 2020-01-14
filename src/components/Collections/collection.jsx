import React, { Component } from "react";
import NavBar from "../navbar";
import {Link} from "react-router-dom";

class Collections extends Component {
  state = {  }
  render() { 
    return (     
    <div>
      <NavBar />
      <h1>Collections</h1>
      <button className="btn btn-success btn-lg">
          <Link to="/collections/add">Add Collection</Link>
        </button>
    </div> );
  }
}
 
export default Collections;
