import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./styles.scss";
import collectionsService from "./collections/collectionsService";
import environmentsService from "./environments/environmentsService";

class Navbar extends Component {
  state = {};
  render() {
    return (
      <nav
        className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow"
        style={{ padding: "10px", borderRadius: "2px", border: "10px" }}
      >
        {this.state.showCollectionForm &&
          collectionsService.showCollectionForm(
            this.props,
            (() => this.setState({ showCollectionForm: false })).bind(this),
            "Add new Collection"
          )}
        {this.state.showEnvironmentForm &&
          environmentsService.showEnvironmentForm(
            this.props,
            (() => this.setState({ showEnvironmentForm: false })).bind(this),
            "Add new Environment"
          )}
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
            <li
              className="dropdown-item"
              onClick={() => console.log("Endpoint")}
            >
              <i className="fas fa-share-square" style={{ margin: "5px" }}></i>{" "}
              Endpoint
            </li>
            <li
              className="dropdown-item"
              onClick={() => {
                this.setState({ showCollectionForm: true });
              }}
            >
              <i className="fas fa-folder-open" style={{ margin: "5px" }}></i>
              Collection
            </li>
            <li
              className="dropdown-item"
              onClick={() => this.setState({ showEnvironmentForm: true })}
            >
              <i className="fas fa-border-none" style={{ margin: "5px" }}></i>
              Environment
            </li>
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
