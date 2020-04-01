import React, { Component } from "react";
import { Link } from "react-router-dom";
import "../styles.scss";
import collectionsService from "../collections/collectionsService";
import environmentsService from "../environments/environmentsService";
import CreateNewModal from "./CreateNewModal";
import { getCurrentUser } from "../auth/authService";
import shortId from "shortid";

class Navbar extends Component {
  state = {
    name: "",
    email: ""
  };
  componentDidMount() {
    const { user } = getCurrentUser();
    const name = user.first_name + user.last_name;
    const email = user.email;
    this.setState({ name, email });
  }

  openCreateNewModal(onHide) {
    return (
      <CreateNewModal
        {...this.props}
        show={true}
        onHide={onHide}
        openCollectionForm={this.openCollectionForm.bind(this)}
        openEnvironmentForm={this.openEnvironmentForm.bind(this)}
      />
    );
  }

  openCollectionForm() {
    this.setState({ showCreateNewModal: false, showCollectionForm: true });
  }

  openEnvironmentForm() {
    this.setState({ showCreateNewModal: false, showEnvironmentForm: true });
  }

  handleAddEndpoint(groupId, versions, groups) {
    const newTabId = shortId.generate();
    const tabs = [
      ...this.props.tabs,
      { id: newTabId, type: "endpoint", isSaved: false }
    ];
    this.props.set_tabs(tabs, tabs.length - 1);
    this.props.history.push({
      pathname: `/dashboard/endpoint/new`
    });
  }

  render() {
    return (
      <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
        {this.state.showCreateNewModal &&
          this.openCreateNewModal(() =>
            this.setState({
              showCreateNewModal: false
            })
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
              onClick={() => this.handleAddEndpoint()}
            >
              <i className="fas fa-share-square" style={{ margin: "5px" }}></i>{" "}
              Endpoint
            </li>
            <li
              className="dropdown-item"
              onClick={() => this.openCollectionForm()}
            >
              <i className="fas fa-folder-open" style={{ margin: "5px" }}></i>
              Collection
            </li>
            <li
              className="dropdown-item"
              onClick={() => this.openEnvironmentForm()}
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

        <div className="btn-grp" id="user-menu">
          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
              style={{ borderRadius: "70px" }}
            >
              <i className="fas fa-user"></i>
            </button>
            <div
              className="dropdown-menu dropdown-menu-right"
              aria-labelledby="dropdownMenuButton"
              alignLeft
            >
              <div id="custom-user-left">
                <i className="fas fa-user"></i>
              </div>
              <div id="custom-user-right">
                <div>{this.state.name}</div>
                <div>{this.state.email}</div>
                <div>
                  <li className=" ">
                    <Link to="/logout">Sign out</Link>
                  </li>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
