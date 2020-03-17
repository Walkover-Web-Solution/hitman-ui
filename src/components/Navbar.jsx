import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./styles.scss";

class Navbar extends Component {
  state = {};
  render() {
    return (
      <nav
        className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow"
        style={{ padding: "10px", borderRadius: "2px", border: "10px" }}
      >
        <div className="btn-group" style={{ backgroundColor: "tomato" }}>
          <button type="button" className="btn">
            <i className="fas fa-plus-square" style={{ margin: "5px" }}></i>
            New
          </button>
          <button
            type="button"
            className="btn  dropdown-toggle dropdown-toggle-split"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
          >
            <span className="sr-only">Toggle Dropdown</span>
          </button>
          <div className="dropdown-menu">
            <a className="dropdown-item" href="#">
              <i className="fas fa-share-square" style={{ margin: "5px" }}></i>{" "}
              Request
            </a>
            <a className="dropdown-item" href="#">
              <i className="fas fa-folder-open" style={{ margin: "5px" }}></i>
              Collection
            </a>
            <a className="dropdown-item" href="#">
              <i className="fas fa-border-none" style={{ margin: "5px" }}></i>
              Environment
            </a>
          </div>
        </div>

        <div className="navbar-nav">
          <button className="btn">Import</button>
        </div>
        {/* <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="/">
          HITMAN
        </a>
        <input
          className="form-control form-control-dark w-100"
          type="text"
          placeholder="Search"
          aria-label="Search"
        />
        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap">
            <Link to="/logout">Sign out</Link>
          </li>
        </ul> */}
      </nav>
    );
  }
}

export default Navbar;
