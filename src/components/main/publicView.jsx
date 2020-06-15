import React, { Component } from "react";
import collectionsApiService from "../collections/collectionsApiService";
import "../styles.scss";
import "./main.scss";
import auth from "../auth/authService";
import filterService from "../../services/filterService";
import { uiUrl } from "../../config.json";
import UserInfo from "../common/userInfo";

class PublicView extends Component {
  state = {
    filteredPublicCollections: {},
  };

  async componentDidMount() {
    const {
      data: response,
    } = await collectionsApiService.getAllPublicCollections();
    this.publicCollections = response;
    this.setState({ filteredPublicCollections: response });
  }

  filterPublicCollections(e) {
    if (e.currentTarget.value.length === 0) {
      this.setState({ filteredPublicCollections: this.publicCollections });
    }
    const filteredPublicCollectionIds = filterService.filter(
      this.publicCollections,
      e.currentTarget.value,
      "publicView"
    );
    const filteredPublicCollections = {};
    for (let i = 0; i < filteredPublicCollectionIds.length; i++) {
      filteredPublicCollections[
        filteredPublicCollectionIds[i]
      ] = this.publicCollections[filteredPublicCollectionIds[i]];
    }
    this.setState({ filteredPublicCollections });
  }

  openCollection(collectionId) {
    const publicDocsUrl = `${uiUrl}/public/${collectionId}`;
    window.open(publicDocsUrl, "_blank");
  }

  render() {
    // const redirectionUrl = `http://localhost:3000/login`;
    const redirectionUrl = `https://hitman-ui.herokuapp.com/login`;
    const socketLoginUrl = `https://viasocket.com/login?token_required=true&redirect_uri=${redirectionUrl}`;

    const filteredPublicCollections = this.state.filteredPublicCollections;
    return (
      <React.Fragment>
        {" "}
        {/* <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
          {auth.getCurrentUser() === null ? (
            <div>
              <button type="button" className="btn ">
                <a href={socketLoginUrl}>Login With ViaSocket</a>
              </button>
            </div>
          ) : (
            <UserInfo></UserInfo>
          )}
        </nav> */}
        <div class="public-dashboard-searchbox">
          <input
            type="text"
            placeholder="Search Collections"
            onChange={this.filterPublicCollections.bind(this)}
          />
        </div>
        <div className="collection-wrap">
          {Object.keys(filteredPublicCollections).map((collectionId) => (
            <div
              onClick={() => this.openCollection(collectionId)}
              className="collection-box"
            >
              <div className="collection-image">
                <img
                  src={`//logo.clearbit.com/${filteredPublicCollections[collectionId].name}.com`}
                ></img>
              </div>
              <h1>{filteredPublicCollections[collectionId].name}</h1>
            </div>
          ))}
        </div>
      </React.Fragment>
    );
  }
}

export default PublicView;
