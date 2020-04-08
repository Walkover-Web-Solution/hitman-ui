import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DisplayEndpoint from "../endpoints/displayEndpoint";
import DisplayPage from "../pages/displayPage";
import SideBar from "../main/sidebar";
import { fetchAllPublicEndpoints } from "./redux/publicEndpointsActions.js";
import "./publicEndpoint.scss";

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllPublicEndpoints: (collectionIdentifier) =>
      dispatch(fetchAllPublicEndpoints(collectionIdentifier)),
  };
};

class PublicEndpoint extends Component {
  componentDidMount() {
    if (this.props.location.pathname) {
      let collectionIdentifier = this.props.location.pathname.split("/")[2];
      this.props.fetchAllPublicEndpoints(collectionIdentifier);
    }
  }

  render() {
    return (
      <main role="main" className="main ml-sm-auto col-lg-10 ">
        <div>
          <ToastContainer />
          <div className="main-panel-wrapper">
            <SideBar {...this.props} />
          </div>

          <div className="main-content">
            <Switch>
              <Route
                path="/public/:collectionId/endpoints/:endpointId"
                render={(props) => <DisplayEndpoint {...props} />}
              />
              <Route
                path="/public/:collectionId/pages/:pageid"
                render={(props) => <DisplayPage {...props} />}
              />
            </Switch>
          </div>
        </div>
      </main>
    );
  }
}

export default connect(null, mapDispatchToProps)(PublicEndpoint);
