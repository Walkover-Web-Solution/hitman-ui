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
import store from "../../store/store";
import auth from "../auth/authService";
import UserInfo from "../common/userInfo";
import { uiUrl } from "../../config.json";

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
    collectionName: "",
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
        // document.title = this.props.collections[
        //   collectionId
        // ].docProperties.domainsList[index].title;
        unsubscribe();
      }
    });
  }

  render() {
    if (
      this.props.collections[this.props.location.pathname.split("/")[2]] &&
      this.props.collections[this.props.location.pathname.split("/")[2]].name &&
      this.state.collectionName === ""
    ) {
      let collectionName = this.props.collections[
        this.props.location.pathname.split("/")[2]
      ].name;
      this.setState({ collectionName });
    }
    const redirectionUrl = uiUrl + "/login";
    if (
      this.props.location.pathname.split("/")[1] === "p" &&
      (this.props.location.pathname.split("/")[3] === undefined ||
        this.props.location.pathname.split("/")[3] === "") &&
      this.state.collectionName !== ""
    ) {
      this.props.history.push({
        pathname: `/p/${this.props.match.params.collectionIdentifier}/description/${this.state.collectionName}`,
      });
      return (
        <div>
          <Switch>
            <Route
              path={`/p/:collectionId/description/${this.state.collectionName}`}
              render={(props) => <DisplayCollection {...props} />}
            />
          </Switch>
        </div>
      );
    } else {
      return (
        <React.Fragment>
          <nav className="public-endpoint-navbar">
            {process.env.REACT_APP_UI_URL === window.location.origin + "/" ? (
              auth.getCurrentUser() === null ? (
                <div className="dropdown user-dropdown">
                  <div className="user-info">
                    <div className="user-avatar">
                      <i className="uil uil-signin"></i>
                    </div>
                    <div className="user-details ">
                      <div className="user-details-heading not-logged-in">
                        <div
                          id="sokt-sso"
                          data-redirect-uri={redirectionUrl}
                          data-source="sokt-app"
                          data-token-key="sokt-auth-token"
                          data-view="button"
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <UserInfo></UserInfo>
              )
            ) : null}
          </nav>
          <main role="main" className="mainpublic-endpoint-main hm-wrapper">
            <ToastContainer />
            <div className="hm-sidebar">
              <SideBar {...this.props} />
              {/* <Environments {...this.props} /> */}
            </div>

            <div className="hm-right-content">
              {this.state.collectionName !== "" ? (
                <Switch>
                  <Route
                    path={`/p/:collectionId/e/:endpointId/${this.state.collectionName}`}
                    render={(props) => <DisplayEndpoint {...props} />}
                  />
                  <Route
                    path={`/p/:collectionId/pages/:pageid/${this.state.collectionName}`}
                    render={(props) => <DisplayPage {...props} />}
                  />
                  <Route
                    path={`/p/:collectionId/description/${this.state.collectionName}`}
                    render={(props) => <DisplayCollection {...props} />}
                  />
                </Switch>
              ) : null}
            </div>
          </main>
        </React.Fragment>
      );
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(PublicEndpoint);
