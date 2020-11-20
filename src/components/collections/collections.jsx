import React, { Component } from "react";
import { Accordion, Card } from "react-bootstrap";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import shortId from "shortid";
import CollectionVersions from "../collectionVersions/collectionVersions";
import collectionVersionsService from "../collectionVersions/collectionVersionsService";
import ImportVersionForm from "../collectionVersions/importVersionForm";
import { isDashboardRoute } from "../common/utility";
import endpointApiService from "../endpoints/endpointApiService";
import {
  fetchAllUsersOfTeam,
  shareCollection,
} from "../teamUsers/redux/teamUsersActions";
import collectionsService from "./collectionsService";
import {
  addCollection,
  deleteCollection,
  duplicateCollection,
  updateCollection,
  addCustomDomain,
} from "./redux/collectionsActions";
import ShareCollectionForm from "./shareCollectionForm";
import "./collections.scss";
import PublishDocsModal from "../publicEndpoint/publishDocsModal";
import authService from "../auth/authService";
import TagManager from "react-gtm-module";
import TagManagerModal from "./tagModal";
import UserNotification from './userNotification'

const mapStateToProps = (state) => {
  return {
    teams: state.teams,
    collections: state.collections,
    versions: state.versions,
    pages: state.pages,
    teamUsers: state.teamUsers,
    groups: state.groups,
    endpoints : state.endpoints,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    add_collection: (newCollection) => dispatch(addCollection(newCollection)),
    share_collection: (teamMemberData) =>
      dispatch(shareCollection(teamMemberData)),
    update_collection: (editedCollection) =>
      dispatch(updateCollection(editedCollection)),
    delete_collection: (collection, props) =>
      dispatch(deleteCollection(collection, props)),
    duplicate_collection: (collection) =>
      dispatch(duplicateCollection(collection)),
    fetch_all_users_of_team: (teamIdentifier) =>
      dispatch(fetchAllUsersOfTeam(teamIdentifier)),
    add_custom_domain: (collectionId, domain, dnsTarget, title, logoUrl) =>
      dispatch(
        addCustomDomain(collectionId, domain, dnsTarget, title, logoUrl)
      ),
  };
};

class CollectionsComponent extends Component {
  state = {
    showCollectionForm: false,
    collectionFormName: "",
    selectedCollection: {},
    showPublishDocsModal: false,
  };
  keywords = {};
  names = {};

  closeCollectionForm() {
    this.setState({ showCollectionForm: false, showImportVersionForm: false });
  }

  async dndMoveEndpoint(endpointId, sourceGroupId, destinationGroupId) {
    const groups = { ...this.state.groups };
    const endpoints = { ...this.state.endpoints };
    const originalEndpoints = { ...this.state.endpoints };
    const originalGroups = { ...this.state.groups };
    const endpoint = endpoints[endpointId];
    endpoint.groupId = destinationGroupId;
    endpoints[endpointId] = endpoint;
    groups[sourceGroupId].endpointsOrder = groups[
      sourceGroupId
    ].endpointsOrder.filter((gId) => gId !== endpointId.toString());
    groups[destinationGroupId].endpointsOrder.push(endpointId);
    this.setState({ endpoints, groups });
    try {
      delete endpoint.id;
      await endpointApiService.updateEndpoint(endpointId, endpoint);
    } catch (error) {
      this.setState({ endpoints: originalEndpoints, groups: originalGroups });
    }
  }

  async handleAddCollection(newCollection) {
    newCollection.requestId = shortId.generate();
    this.props.add_collection(newCollection);
  }

  async handleUpdateCollection(editedCollection) {
    this.props.update_collection(editedCollection);
  }

  async handleDeleteGroup(deletedGroupId) {
    this.props.delete_group(deletedGroupId);
  }

  async handleAddVersionPage(versionId, newPage) {
    newPage.requestId = shortId.generate();
    this.props.add_page(versionId, newPage);
  }

  async handleDuplicateCollection(collectionCopy) {
    this.props.duplicate_collection(collectionCopy);
  }
  async handleGoToDocs(collection) {
    const publicDocsUrl = `${process.env.REACT_APP_UI_URL}/p/${collection.id}`;
    window.open(publicDocsUrl, "_blank");
  }

  showShareCollectionForm() {
    return (
      this.state.showCollectionShareForm && (
        <ShareCollectionForm
          {...this.props}
          show={true}
          onHide={() => {
            this.setState({ showCollectionShareForm: false });
          }}
          team_id={this.state.selectedCollection.teamId}
          title="Share Collection"
          collection_id={this.state.selectedCollection.id}
        />
      )
    );
  }

  shareCollection(collectionId) {
    this.props.fetch_all_users_of_team(
      this.props.collections[collectionId].teamId
    );
    this.setState({
      showCollectionShareForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
      collectionFormName: "Share Collection",
    });
  }

  openAddCollectionForm() {
    this.setState({
      showCollectionForm: true,
      collectionFormName: "Add new Collection",
    });
  }

  openEditCollectionForm(collectionId) {
    this.setState({
      showCollectionForm: true,
      collectionFormName: "Edit Collection",
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
    });
  }

  openAddVersionForm(collectionId) {
    this.setState({
      showVersionForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
    });
  }
  openImportVersionForm(collectionId) {
    this.setState({
      showImportVersionForm: true,
      collectionFormName: "Import Version",
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
    });
  }

  openDeleteCollectionModal(collectionId) {
    if (this.state.openSelectedCollection === true) {
      this.setState({ openSelectedCollection: false });
    }
    this.setState({
      showDeleteModal: true,
      selectedCollection: {
        ...this.props.collections[collectionId],
      },
    });
  }

  showImportVersionForm() {
    return (
      this.state.showImportVersionForm && (
        <ImportVersionForm
          {...this.props}
          show={this.state.showImportVersionForm}
          onHide={() => this.closeCollectionForm()}
          title={this.state.collectionFormName}
          selected_collection={this.state.selectedCollection}
        />
      )
    );
  }

  handlePublicCollectionDescription(collection) {
    this.props.history.push({
      pathname: `/p/${collection.id}/description/${collection.name}`,
      collection,
    });
  }

  closeVersionForm() {
    this.setState({ showVersionForm: false });
  }

  handlePublic(collection) {
    collection.isPublic = !collection.isPublic;
    delete collection.teamId;
    this.props.update_collection({ ...collection });
  }

  closeDeleteCollectionModal() {
    this.setState({ showDeleteModal: false });
  }
  openSelectedCollection(collectionId) {
    this.props.empty_filter();
    this.props.collection_selected(collectionId);
    this.collectionId = collectionId;
    this.setState({ openSelectedCollection: true });
  }
  openAllCollections() {
    this.props.empty_filter();
    this.collectionId = null;
    this.setState({ openSelectedCollection: false });
  }

  fetchCurrentUserRole() {
    const { user: currentUser } = authService.getCurrentUser();
    const teamArray = Object.keys(this.props.teamUsers);
    for (let i = 0; i < teamArray.length; i++) {
      if (currentUser.identifier === teamArray[i]) {
        return this.props.teamUsers[currentUser.identifier].role;
      }
    }
  }

  TagManagerModal(collectionId) {
    this.setState({ TagManagerCollectionId: collectionId });
  }

  openTagManagerModal() {
    return (
      this.state.TagManagerCollectionId && (
        <TagManagerModal
          {...this.props}
          show={true}
          onHide={() => this.setState({ TagManagerCollectionId: false })}
          title={"Google Tag Manager"}
          collection_id={this.state.TagManagerCollectionId}
        />
      )
    );
  }

  dataFetched(){
    return (this.props.collections && this.props.versions && this.props.groups && this.props.endpoints && this.props.pages)
  }


  findEndpointCount(collectionId){
    if(this.dataFetched()){
      let versionIds = Object.keys(this.props.versions).filter(vId => this.props.versions[vId].collectionId === collectionId)
      let groupIds = Object.keys(this.props.groups)
      let groupsArray = []
      for (let i = 0; i < groupIds.length; i++) {
        const groupId = groupIds[i];
        const group = this.props.groups[groupId]
        
        if(versionIds.includes(group.versionId))
        groupsArray.push(groupId)
      }
      
      let endpointIds = Object.keys(this.props.endpoints)
      let endpointsArray = []
      
      for (let i = 0; i <endpointIds.length; i++) {
        const endpointId = endpointIds[i];
        const endpoint = this.props.endpoints[endpointId]
        
        if(groupsArray.includes(endpoint.groupId))
        endpointsArray.push(endpointId)
        
      }
      return endpointsArray.length
    }
      
    }

 
  // findEndpointCount(collectionId){
  //   if(this.dataFetched()){
  //     return Object.keys(this.props.endpoints).filter(eId => this.props.endpoints[eId].collectionId === collectionId).length
  //     }
  //   }
    
    renderBody(collectionId, collectionState) {
    let eventkeyValue = "";
    if (this.props.filter !== "") {
      eventkeyValue = "0";
    } else {
      eventkeyValue = null;
    }

    if (document.getElementById("collection-collapse")) {
      if (
        document
          .getElementById("collection-collapse")
          .className.split(" ")[1] !== "show" &&
        this.props.filter
      ) {
        document.getElementById("collection-collapse").className =
          "collapse show";
      }
    }

    return (
      <React.Fragment key={collectionId}>
        {collectionState === "singleCollection" ? (
          <button
            id="back-to-all-collections-button"
            className="btn"
            onClick={() => this.openAllCollections()}
          >
            <i className="fas fa-arrow-left"></i>
            <label>All Collections</label>
          </button>
        ) : null}

        <Accordion
          defaultActiveKey="0"
          key={collectionId}
          id="parent-accordion"
          className="sidebar-accordion"
        >
          {/* <Card> */}
          {/* <Card.Header> */}
          <Accordion.Toggle
            variant="default"
            eventKey={eventkeyValue !== null ? eventkeyValue : "0"}
          >
            {collectionState === "singleCollection" ? (
              <React.Fragment>
              <div>{this.props.collections[collectionId].name}</div>
              </React.Fragment>
            ) : (
              <div
                className="sidebar-accordion-item"
                onClick={() => this.openSelectedCollection(collectionId)}
              >
                <i className="uil uil-parcel"></i>
                <div >
                 {this.props.collections[collectionId].name}
                </div>
              </div>
            )}
              <div class="show-endpoint-count">{this.findEndpointCount(collectionId)}</div>
            <div className="sidebar-item-action">
              <div
                className="sidebar-item-action-btn "
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="uil uil-ellipsis-v"></i>
              </div>
              <div className="dropdown-menu dropdown-menu-right">
                <a
                  className="dropdown-item"
                  onClick={() => this.openEditCollectionForm(collectionId)}
                >
                  Edit
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.openDeleteCollectionModal(collectionId);
                  }}
                >
                  Delete
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => this.openAddVersionForm(collectionId)}
                >
                  Add Version
                </a>
                <a
                  className="dropdown-item"
                  onClick={() =>
                    this.handleDuplicateCollection(
                      this.props.collections[collectionId]
                    )
                  }
                >
                  Duplicate
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => this.openImportVersionForm(collectionId)}
                >
                  Import Version
                </a>
                {this.props.collections[collectionId].isPublic && (
                  <a
                    className="dropdown-item"
                    onClick={() =>
                      this.handleGoToDocs(this.props.collections[collectionId])
                    }
                  >
                    Go to Docs
                  </a>
                )}
                {/* {(this.currentUserRole==="Admin"||this.currentUserRole==="Owner") && ( */}
                <a
                  className="dropdown-item"
                  onClick={() =>
                    this.openPublishDocs(this.props.collections[collectionId])
                  }
                >
                  Publish Docs
                </a>

                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.shareCollection(collectionId);
                  }}
                >
                  Share
                </a>
                <a
                  className="dropdown-item"
                  onClick={() => {
                    this.TagManagerModal(collectionId);
                  }}
                >
                  Add Google Tag Manager
                </a>
              </div>
            </div>
          </Accordion.Toggle>
          {/* </Card.Header> */}
          {collectionState === "singleCollection" ? (
            <Accordion.Collapse id="collection-collapse" eventKey="0">
              <Card.Body>
                <CollectionVersions
                  {...this.props}
                  collection_id={collectionId}
                  selectedCollection={true}
                />
              </Card.Body>
            </Accordion.Collapse>
          ) : null}
          {/* </Card> */}
        </Accordion>


      
      </React.Fragment>
    );
  }

  openPublishDocs(collection) {
    this.props.history.push({
      pathname: `/admin/publish`,
      search: `?collectionId=${collection.id}`,
    })
    // this.setState({
    //   showPublishDocsModal: true,
    //   selectedCollection: collection.id,
    // });
  }

  showPublishDocsModal(onHide) {
    return (
      <PublishDocsModal
        {...this.props}
        show={true}
        onHide={onHide}
        collection_id={this.state.selectedCollection}
      // add_new_endpoint={this.handleAddEndpoint.bind(this)}
      // open_collection_form={this.openCollectionForm.bind(this)}
      // open_environment_form={this.openEnvironmentForm.bind(this)}
      />
    );
  }

  addGTM(gtmId) {
    if (gtmId) {
      const tagManagerArgs = {
        gtmId: gtmId,
      };
      TagManager.initialize(tagManagerArgs);
    }
  }


  findPendingPagesCollections(pendingPageIds){
    let versionsArray = []
    for (let i = 0; i < pendingPageIds.length; i++) {
      const pageId = pendingPageIds[i];
      if(this.props.pages[pageId]){
        const versionId = this.props.pages[pageId].versionId
        versionsArray.push(versionId)
      }
    }
    let collectionsArray = []
    for (let i = 0; i < versionsArray.length; i++) {
      const versionId = versionsArray[i];
      if(this.props.versions[versionId]){
        const collectionId = this.props.versions[versionId].collectionId
        collectionsArray.push(collectionId)
      }
    }
    return collectionsArray
  }

  findPendingEndpointsCollections(pendingEndpointIds){
    let groupsArray = []
      for (let i = 0; i < pendingEndpointIds.length; i++) {
        const endpointId = pendingEndpointIds[i];
        if(this.props.endpoints[endpointId]){
        const groupId = this.props.endpoints[endpointId].groupId
        groupsArray.push(groupId)
        }
      }

      let versionsArray = []
      for (let i = 0; i < groupsArray.length; i++) {
        const groupId = groupsArray[i];
        if(this.props.groups[groupId]){
          const versionId = this.props.groups[groupId].versionId
           versionsArray.push(versionId)
          }
      }
      let collectionsArray = []
      for (let i = 0; i < versionsArray.length; i++) {
        const versionId = versionsArray[i];
        if(this.props.versions[versionId]){
          const collectionId = this.props.versions[versionId].collectionId
          collectionsArray.push(collectionId)
        }

        }
      return collectionsArray
  }

  getNotificationCount(){
    if(this.dataFetched()){
      const pendingEndpointIds = Object.keys(this.props.endpoints).filter(eId=>this.props.endpoints[eId].state==="Pending")
      const pendingPageIds = Object.keys(this.props.pages).filter(pId=>this.props.pages[pId].state==="Pending")
      
      const endpointCollections = this.findPendingEndpointsCollections(pendingEndpointIds)
      const pageCollections = this.findPendingPagesCollections(pendingPageIds)

      let finalCollections = [...new Set([...endpointCollections,...pageCollections])] 
      return finalCollections.length
    }
  }

  render() {
    if (isDashboardRoute(this.props)) {
      let finalCollections = [];
      this.names = {};
      let finalnames = [];
      this.keywords = {};
      let finalKeywords = [];
      let collections = { ...this.props.collections };
      let CollectionIds = Object.keys(collections);

      for (let i = 0; i < CollectionIds.length; i++) {
        const { keyword } = this.props.collections[CollectionIds[i]];
        const splitedKeywords = keyword.split(",");

        for (let j = 0; j < splitedKeywords.length; j++) {
          let keyword = splitedKeywords[j];

          if (keyword !== "") {
            if (this.keywords[keyword]) {
              const ids = this.keywords[keyword];
              if (ids.indexOf(CollectionIds[i]) === -1) {
                this.keywords[keyword] = [...ids, CollectionIds[i]];
              }
            } else {
              this.keywords[keyword] = [CollectionIds[i]];
            }
          }
        }
      }
      let keywords = Object.keys(this.keywords);
      finalKeywords = keywords.filter((key) => {
        return (
          key.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1
        );
      });

      let keywordFinalCollections = [];
      for (let i = 0; i < finalKeywords.length; i++) {
        keywordFinalCollections = [
          ...keywordFinalCollections,
          ...this.keywords[finalKeywords[i]],
        ];
      }
      keywordFinalCollections = [...new Set(keywordFinalCollections)];

      for (let i = 0; i < CollectionIds.length; i++) {
        const { name } = this.props.collections[CollectionIds[i]];
        this.names[name] = CollectionIds[i];
      }
      let names = Object.keys(this.names);
      finalnames = names.filter((name) => {
        return (
          name.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1
        );
      });
      let namesFinalCollections = finalnames.map((name) => this.names[name]);
      namesFinalCollections = [...new Set(namesFinalCollections)];
      finalCollections = [...keywordFinalCollections, ...namesFinalCollections];

      finalCollections = [...new Set(finalCollections)];
      return (
        <div>
          {this.state.showPublishDocsModal &&
            this.showPublishDocsModal(() =>
              this.setState({
                showPublishDocsModal: false,
              })
            )}
          <div className="App-Nav">
            <div className="tabs">
              {this.state.showVersionForm &&
                collectionVersionsService.showVersionForm(
                  this.props,
                  this.closeVersionForm.bind(this),
                  this.state.selectedCollection.id,
                  "Add new Collection Version"
                )}
              {this.state.showCollectionForm &&
                collectionsService.showCollectionForm(
                  this.props,
                  this.closeCollectionForm.bind(this),
                  this.state.collectionFormName,
                  this.state.selectedCollection
                )}
              {this.showImportVersionForm()}
              {this.showShareCollectionForm()}
              {this.openTagManagerModal()}
              {this.state.showDeleteModal &&
                collectionsService.showDeleteCollectionModal(
                  { ...this.props },
                  this.closeDeleteCollectionModal.bind(this),
                  "Delete Collection",
                  `Are you sure you wish to delete this collection? All your versions,
                   groups, pages and endpoints present in this collection will be deleted.`,
                  this.state.selectedCollection
                )}
            </div>
          </div>

          <div className="App-Side">
            <div className="add-collection-btn-wrap">
              <button
                className="add-collection-btn"
                onClick={() => this.openAddCollectionForm()}
              >
                <i className="uil uil-plus"></i>
                New Collection
              </button>
            </div>
            {/* {this.state.openSelectedCollection &&
              this.renderBody(this.collectionId, "singleCollection")} */}
            {/* {!this.state.openSelectedCollection &&
              finalCollections.map((collectionId, index) =>
                this.renderBody(collectionId, "allCollections")
              )} */}
            {finalCollections.map((collectionId, index) =>
              this.renderBody(collectionId, "allCollections")
            )}

        <div className="fixed">
          <UserNotification {...this.props} get_notification_count = {this.getNotificationCount.bind(this)}></UserNotification>
          {/* Notifications
            <div>count : {this.getNotificationCount()}</div> */}
        </div>
              
          </div>
          
        </div>
        
      );
    } else {
      return (
        <React.Fragment>
          {Object.keys(this.props.collections).map((collectionId, index) => (
            <React.Fragment>
              {this.addGTM(this.props.collections[collectionId].gtmId)}
              <div
                className="hm-sidebar-header"
                onClick={() =>
                  this.handlePublicCollectionDescription(
                    this.props.collections[collectionId]
                  )
                }
              >
                <div className="hm-sidebar-logo">
                  <img
                    src={`//logo.clearbit.com/${this.props.collections[collectionId].name}.com`}
                    onClick={() =>
                      window.open(this.props.collections[collectionId].website)
                    }
                  ></img>
                </div>
                <h4 className="hm-sidebar-title">
                  {this.props.collections[collectionId].name}
                </h4>
              </div>
              <div id="parent-accordion" key={index}>
                <CollectionVersions
                  {...this.props}
                  collection_id={collectionId}
                />
              </div>
            </React.Fragment>
          ))}
        </React.Fragment>
      );
    }
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CollectionsComponent)
);
