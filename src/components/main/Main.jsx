import React, { Component } from "react";
import { connect } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { fetchCollections } from "../collections/redux/collectionsActions";
import { fetchAllVersions } from "../collectionVersions/redux/collectionVersionsActions";
import {
  fetchEndpoints,
  moveEndpoint,
} from "../endpoints/redux/endpointsActions";
import { fetchGroups } from "../groups/redux/groupsActions";
import indexedDbService from "../indexedDb/indexedDbService";
import { fetchPages } from "../pages/redux/pagesActions";
import { fetchAllTeamsOfUser } from "../teams/redux/teamsActions";
import ContentPanel from "./contentPanel";
import "./main.scss";
import Navbar from "./Navbar";
import SideBar from "./sidebar";

const mapDispatchToProps = (dispatch) => {
  return {
    fetchAllTeamsOfUser: () => dispatch(fetchAllTeamsOfUser()),
    fetchCollections: () => dispatch(fetchCollections()),
    fetchAllVersions: () => dispatch(fetchAllVersions()),
    fetchGroups: () => dispatch(fetchGroups()),
    fetchEndpoints: () => dispatch(fetchEndpoints()),
    fetchPages: () => dispatch(fetchPages()),
    moveEndpoint: (endpointId, sourceGroupId, destinationGroupId) =>
      dispatch(moveEndpoint(endpointId, sourceGroupId, destinationGroupId)),
  };
};

class Main extends Component {
  state = {
    tabs: [],
    defaultTabIndex: 0,
  };

  async componentDidMount() {
    this.fetchAll();
    await indexedDbService.createDataBase();
  }

  fetchAll() {
    this.props.fetchAllTeamsOfUser();
    this.props.fetchCollections();
    this.props.fetchAllVersions();
    this.props.fetchGroups();
    this.props.fetchEndpoints();
    this.props.fetchPages();
  }

  setTabs(tabs, defaultTabIndex) {
    if (defaultTabIndex >= 0) {
      this.setState({ defaultTabIndex });
    }
    if (tabs) {
      this.setState({ tabs });
    }
  }
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
      <div className="custom-main-container">
        <ToastContainer />
        <Navbar
          {...this.props}
          tabs={[...this.state.tabs]}
          set_tabs={this.setTabs.bind(this)}
        />
        <div className="main-panel-wrapper">
          <SideBar
            {...this.props}
            set_source_group_id={this.setSourceGroupId.bind(this)}
            set_destination_group_id={this.setDestinationGroupId.bind(this)}
            tabs={[...this.state.tabs]}
            set_tabs={this.setTabs.bind(this)}
            default_tab_index={this.state.defaultTabIndex}
          />
          <ContentPanel
            {...this.props}
            set_environment={this.setEnvironment.bind(this)}
            set_tabs={this.setTabs.bind(this)}
            default_tab_index={this.state.defaultTabIndex}
          />
        </div>
      </div>
    );
  }
}

export default connect(null, mapDispatchToProps)(Main);
