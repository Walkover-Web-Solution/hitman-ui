import React, { Component } from "react";
import { Button } from "react-bootstrap";
import MyPicker from "./customColorPicker";
import SideBar from "../main/sidebar";
import "./publishDocs.scss";
import { connect } from "react-redux";
import { fetchCollections } from "../collections/redux/collectionsActions";
import { fetchAllVersions } from "../collectionVersions/redux/collectionVersionsActions";
import { fetchEndpoints } from "../endpoints/redux/endpointsActions";
import { fetchGroups } from "../groups/redux/groupsActions";
import { fetchPages } from "../pages/redux/pagesActions";
import PublishDocsForm from "./publishDocsForm";

const mapDispatchToProps = (dispatch) => {
  return {
    fetch_collections: () => dispatch(fetchCollections()),
    fetch_all_versions: () => dispatch(fetchAllVersions()),
    fetch_groups: () => dispatch(fetchGroups()),
    fetch_endpoints: () => dispatch(fetchEndpoints()),
    fetch_pages: () => dispatch(fetchPages()),
  };
};

class PublishDocs extends Component {
  state = {};

  fetchAll() {
    this.props.fetch_collections();
    this.props.fetch_all_versions();
    this.props.fetch_groups();
    this.props.fetch_endpoints();
    this.props.fetch_pages();
  }

  componentDidMount() {
    this.fetchAll();
  }

  render() {
    return (
      <div className="publish-docs-container">
        <div className="publish-docs-wrapper">
          <SideBar {...this.props} />
          <div class="content-panel">
            <div className="hosted-APIs">
              <div class="title">Hosted API's</div>
              <select className="selected-API" name="MSG91">
                <option>option1</option>
                <option>option2</option>
              </select>
            </div>
            <div className="grid">
              <div className="grid-column-one">
                <div className="domain">
                  <PublishDocsForm />
                </div>
                <div className="product"></div>
              </div>

              <div className="grid-column-two">
                <div>Pick your favorite color for website</div>
                <div>
                  <MyPicker />
                </div>
              </div>

              <div className="publish-button">
                {" "}
                <Button variant="success">PUBLISH ALL</Button>
              </div>
            </div>

            <div className="grid-two">
              <div className="grid-column-three">
                <select className="selected-API" name="MSG91">
                  <option>option1</option>
                  <option>option2</option>
                </select>
              </div>
              <div className="grid-column-four">
                <div className="contacts">Contacts</div>

                <div className="list-contacts">List of contacts</div>
              </div>

              <div className="grid-column-five">
                <button class="btn default">Reject</button>
              </div>

              <div className="grid-column-six">
                <div className="publish-button">
                  {" "}
                  <Button variant="success">PUBLISH</Button>
                </div>
              </div>
            </div>
            <div className="grid-three">
              <div className="grid-column-seven">sdads</div>
              <div className="grid-column-eight">
                <div></div>
                <div>sdas</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(PublishDocs);
