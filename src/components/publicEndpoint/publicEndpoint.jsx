import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DisplayEndpoint from "../endpoints/displayEndpoint";
import DisplayPage from "../pages/displayPage";
import DisplayCollection from "../collections/displayCollection";
import SideBar from "../main/sidebar";
import { fetchAllPublicEndpoints } from "./redux/publicEndpointsActions.js";
import "./publicEndpoint.scss";
import Environments from "../environments/environments";
import store from "../../store/store";
import auth from "../auth/authService";
import UserInfo from "../common/userInfo";

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
  };
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    fetch_all_public_endpoints: (collectionIdentifier) =>
      dispatch(fetchAllPublicEndpoints(ownProps.history, collectionIdentifier)),
  };
};

class PublicEndpoint extends Component {
  state = {
    publicCollectionId: "",
  };

  componentDidMount() {
    if (this.props.location.pathname) {
      let collectionIdentifier = this.props.location.pathname.split("/")[2];
      this.props.fetch_all_public_endpoints(collectionIdentifier);
      this.props.history.push({
        collectionIdentifier: collectionIdentifier,
        Environment: "publicCollectionEnvironment",
      });
    }

    const unsubscribe = store.subscribe(() => {
      const baseUrl = window.location.href.split("/")[2];
      const collectionId = this.props.location.collectionIdentifier;
      const domain = this.props.location.pathname.split("/");

      if (this.props.collections[collectionId]) {
        const index = this.props.collections[
          collectionId
        ].docProperties.domainsList.findIndex((d) => d.domain === baseUrl);
        document.title = this.props.collections[
          collectionId
        ].docProperties.domainsList[index].title;
        unsubscribe();
      }
    });
  }

  render() {
    const redirectionUrl = `http://localhost:3000/login`;
    // const redirectionUrl = `https://hitman-ui.herokuapp.com/login`;
    const socketLoginUrl = `https://viasocket.com/login?token_required=true&redirect_uri=${redirectionUrl}`;
    if (
      this.props.location.pathname.split("/")[1] === "public" &&
      (this.props.location.pathname.split("/")[3] === undefined ||
        this.props.location.pathname.split("/")[3] === "")
    ) {
      this.props.history.push({
        pathname: `/public/${this.props.match.params.collectionIdentifier}/description`,
      });
      return (
        <div>
          <Switch>
            <Route
              path="/public/:collectionId/description"
              render={(props) => <DisplayCollection {...props} />}
            />
          </Switch>
        </div>
      );
    } else {
      return (
        <React.Fragment>
          <nav className="navbar  public-endpoint-navbar">
            <img
              className="hitman-logo"
              alt=""
              src={require("../../hitman-icon.png")}
            />
            {process.env.REACT_APP_UI_URL === window.location.origin + "/" ? (
              auth.getCurrentUser() === null ? (
                <div>
                  <button
                    className="btn btn-primary btn-lg"
                    id="custom-login-button"
                  >
                    <a href={socketLoginUrl}>Login With ViaSocket</a>
                  </button>
                </div>
              ) : (
                <div>
                  <UserInfo></UserInfo>
                </div>
              )
            ) : null}
          </nav>
          <main
            role="main"
            className="main ml-sm-auto col-lg-10 public-endpoint-main "
          >
            <div>
              <ToastContainer />
              <div className="main-panel-wrapper">
                <SideBar {...this.props} />
                {/* <Environments {...this.props} /> */}
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
                  <Route
                    path="/public/:collectionId/description"
                    render={(props) => <DisplayCollection {...props} />}
                  />
                </Switch>
              </div>
            </div>
          </main>
        </React.Fragment>
      );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicEndpoint);
