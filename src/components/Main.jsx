import React, { Component } from "react";
import { connect } from "react-redux";
import { Link, Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DisplayEndpoint from "./endpoints/displayEndpoint";
import { moveEndpoint } from "./endpoints/endpointsActions";
import Environments from "./environments/environments";
import DisplayPage from "./pages/displayPage";
import EditPage from "./pages/editPage";
import SideBar from "./sidebar";

const mapDispatchToProps = dispatch => {
  return {
    moveEndpoint: (endpointId, sourceGroupId, destinationGroupId) =>
      dispatch(moveEndpoint(endpointId, sourceGroupId, destinationGroupId))
  };
};

class Main extends Component {
  state = {
    currentEnvironment: { id: null, name: "No Environment" }
  };
  setEnvironment(environment) {
    this.setState({ currentEnvironment: environment });
  }

  setSourceGroupId(draggedEndpoint, groupId) {
    this.draggedEndpoint = draggedEndpoint;
    this.sourceGroupId = groupId;
  }

  setDestinationGroupId(destinationGroupId) {
    this.dndMoveEndpoint(
      this.draggedEndpoint,
      this.sourceGroupId,
      destinationGroupId
    );
  }

  dndMoveEndpoint(endpointId, sourceGroupId, destinationGroupId) {
    if (sourceGroupId !== destinationGroupId)
      this.props.moveEndpoint(endpointId, sourceGroupId, destinationGroupId);
  }

  render() {
    return (
      <div>
        <ToastContainer />
        <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          <a className="navbar-brand col-sm-3 col-md-2 mr-0" href="/">
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
          </ul>
        </nav>
        <div className="container-fluid">
          <div className="row">
            <Route>
              <SideBar
                {...this.props}
                set_source_group_id={this.setSourceGroupId.bind(this)}
                set_destination_group_id={this.setDestinationGroupId.bind(this)}
              />
            </Route>
            <ToastContainer />
            <main
              role="main"
              className="main col-md-9 ml-sm-auto col-lg-9 px-4 "
            >
              <Route>
                <Environments
                  {...this.props}
                  set_environment={this.setEnvironment.bind(this)}
                />
              </Route>
              <div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom" />
              <ToastContainer />
              <Switch>
                <Route
                  path="/dashboard/endpoints"
                  render={props => (
                    <DisplayEndpoint {...props} environment={{}} />
                  )}
                />
                <Route
                  path="/dashboard/endpoints/:endpointId"
                  render={props => (
                    <DisplayEndpoint {...props} environment={{}} />
                  )}
                />
                <Route
                  path="/dashboard/pages/:pageid/edit"
                  render={props => <EditPage {...props} />}
                />
                <Route
                  path="/dashboard/pages/:pageid"
                  render={props => <DisplayPage {...props} />}
                />
              </Switch>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Main);
