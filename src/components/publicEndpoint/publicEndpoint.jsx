import React, { Component } from "react";
import { ToastContainer } from "react-toastify";
import { connect } from "react-redux";
import "react-toastify/dist/ReactToastify.css";
import SideBar from "../sidebar";
import { fetchAllPublicEndpoints } from "./redux/publicEndpointsActions.js";

const mapDispatchToProps = dispatch => {
  return {
    fetchAllPublicEndpoints: collectionIdentifier =>
      dispatch(fetchAllPublicEndpoints(collectionIdentifier))
  };
};

class PublicEndpoint extends Component {
  componentDidMount() {
    if (this.props.location.pathname) {
      let collectionIdentifier = this.props.location.pathname.split("/")[2];
      console.log("aaa", collectionIdentifier);
      // this.props.fetchAllPublicEndpoints(collectionIdentifier);
    }
  }

  render() {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-start"
        }}
      >
        <ToastContainer />
        <div className="wrapper">
          <SideBar {...this.props} />
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(PublicEndpoint);
