import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./styles.scss";
import collectionsService from "./collections/collectionsService";
import environmentsService from "./environments/environmentsService";
import CreateNewModal from "./CreateNewModal";

class Navbar extends Component {
  state = {};

  openCreateNewModal(onHide) {
    return <CreateNewModal show={true} onHide={onHide} />;
  }
  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        {this.state.showCreateNewModal &&
          this.openCreateNewModal(() =>
            this.setState({ showCreateNewModal: false })
          )}
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
        <div className="btn-group">
          <button
            id="new-button"
            className="btn"
            onClick={() => this.setState({ showCreateNewModal: true })}
          >
            <i className="fas fa-plus-square"></i>
            New
          </button>
          <button
            id="new-button-dropdown"
            className="btn  dropdown-toggle dropdown-toggle-split"
            data-toggle="dropdown"
            aria-haspopup="true"
            aria-expanded="false"
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
              onClick={() => this.setState({ showEnvironmentForm: true })}
            >
              <i className="fas fa-border-none" style={{ margin: "5px" }}></i>
              Environment
            </li>
          </div>

          <button id="nav-left-buttons" className="btn ">
            Import
          </button>

          <div className="dropdown" id="nav-left-buttons">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
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

        <div className="btn-grp">
          <div class="dropdown">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              style={{ borderRadius: "70px" }}
            >
              <i class="fas fa-user"></i>
            </button>
            <div
              class="dropdown-menu dropdown-menu-right"
              aria-labelledby="dropdownMenuButton"
              alignLeft
            >
              <i class="fas fa-user" style={{ float: "left" }}></i>
              <div style={{ float: "right" }}>
                <h4>User Name</h4>
                <h5>user email</h5>
                <li className="nav-item text-nowrap">
                  <Link to="/logout">Sign out</Link>
                </li>
              </div>
            </div>
          </div>
        </div>
        {/* 
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
