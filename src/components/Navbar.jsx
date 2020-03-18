import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./styles.scss";
import collectionsService from "./collections/collectionsService";

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

        <div className="btn-group">
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: "tomato", margin: "5px 0px 5px 5px" }}
          >
            <i className="fas fa-plus-square" style={{ margin: "5px" }}></i>
            New
          </button>
          <button
            type="button"
            className="btn  dropdown-toggle dropdown-toggle-split"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
            style={{ backgroundColor: "tomato", margin: "5px 5px 5px 0px" }}
          ></button>
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
              onClick={() => console.log("Environment")}
            >
              <i className="fas fa-border-none" style={{ margin: "5px" }}></i>
              Environment
            </li>
          </div>
          <div className="navbar-nav">
            <button
              type="button"
              className="btn btn-secondary"
              style={{ margin: "5px" }}
            >
              Import
            </button>
          </div>
          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              style={{ margin: "5px" }}
            >
              <i className="fa fa-file-text" aria-hidden="true"></i>
            </button>
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a className="dropdown-item" href="#">
                Open new Tab
              </a>
            </div>
          </div>
        </div>

        <ul className="navbar-nav px-3">
          <li className="nav-item text-nowrap">
            <Link to="/logout">Sign out</Link>
          </li>
        </ul>
      </nav>
    );
  }
}

export default Navbar;
