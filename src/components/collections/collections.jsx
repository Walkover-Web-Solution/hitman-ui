import React, { Component } from "react";
import {
  Accordion,
  Button,
  Card,
  Dropdown,
  DropdownButton,
  Tabs,
  Tab
} from "react-bootstrap";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import shortId from "shortid";
import CollectionVersions from "../collectionVersions/collectionVersions";
import ImportVersionForm from "../collectionVersions/importVersionForm";
import ShareVersionForm from "../collectionVersions/shareVersionForm";
import PageForm from "../pages/pageForm";
import collectionVersionsApiService from "../collectionVersions/collectionVersionsApiService";
import collectionVersionsService from "../collectionVersions/collectionVersionsService";
import collectionsService from "./collectionsService";
import endpointService from "../endpoints/endpointService";
import { fetchAllVersions } from "../collectionVersions/redux/collectionVersionsActions";
import { fetchEndpoints } from "../endpoints/redux/endpointsActions";
import { fetchGroups } from "../groups/redux/groupsActions";
import { fetchPages } from "../pages/redux/pagesActions";
import {
  addCollection,
  updateCollection,
  deleteCollection,
  duplicateCollection,
  fetchCollections
} from "./redux/collectionsActions";
import { relative } from "joi-browser";

const mapStateToProps = state => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchCollections: () => dispatch(fetchCollections()),
    fetchAllVersions: () => dispatch(fetchAllVersions()),
    fetchGroups: () => dispatch(fetchGroups()),
    fetchEndpoints: () => dispatch(fetchEndpoints()),
    fetchPages: () => dispatch(fetchPages()),
    addCollection: newCollection => dispatch(addCollection(newCollection)),
    updateCollection: editedCollection =>
      dispatch(updateCollection(editedCollection)),
    deleteCollection: collection => dispatch(deleteCollection(collection)),
    duplicateCollection: collection => dispatch(duplicateCollection(collection))
  };
};

class CollectionsComponent extends Component {
  state = {
    showCollectionForm: false,
    collectionFormName: "",
    selectedCollection: {}
  };

  async componentDidMount() {
    this.props.fetchCollections();
    this.props.fetchAllVersions();
    this.props.fetchGroups();
    this.props.fetchEndpoints();
    this.props.fetchPages();
  }

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
    ].endpointsOrder.filter(gId => gId !== endpointId.toString());
    groups[destinationGroupId].endpointsOrder.push(endpointId);
    this.setState({ endpoints, groups });
    try {
      delete endpoint.id;
      await endpointService.updateEndpoint(endpointId, endpoint);
    } catch (error) {
      this.setState({ endpoints: originalEndpoints, groups: originalGroups });
    }
  }

  async handleAddCollection(newCollection) {
    newCollection.requestId = shortId.generate();
    this.props.addCollection(newCollection);
  }

  async handleDelete(collection) {
    this.props.deleteCollection(collection);
  }

  async handleUpdateCollection(editedCollection) {
    this.props.updateCollection(editedCollection);
  }

  async handleDeleteGroup(deletedGroupId) {
    this.props.deleteGroup(deletedGroupId);
  }

  async handleAddVersionPage(versionId, newPage) {
    newPage.requestId = shortId.generate();
    this.props.addPage(versionId, newPage);
  }

  async handleDuplicateCollection(collectionCopy) {
    this.props.duplicateCollection(collectionCopy);
  }

  openAddCollectionForm() {
    this.setState({
      showCollectionForm: true,
      collectionFormName: "Add new Collection"
    });
  }

  // showCollectionForm() {
  //   return (
  //     this.state.showCollectionForm && (
  //       <CollectionForm
  //         {...this.props}
  //         show={this.state.showCollectionForm}
  //         onHide={() => this.closeCollectionForm()}
  //         title={this.state.collectionFormName}
  //         edited_collection={this.state.selectedCollection}
  //       />
  //     )
  //   );
  // }
  openEditCollectionForm(collectionId) {
    this.setState({
      showCollectionForm: true,
      collectionFormName: "Edit Collection",
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    });
  }

  openAddVersionForm(collectionId) {
    this.setState({
      showVersionForm: true,
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
    });
  }
  openImportVersionForm(collectionId) {
    this.setState({
      showImportVersionForm: true,
      collectionFormName: "Import Version",
      selectedCollection: {
        ...this.props.collections[collectionId]
      }
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

  routeToAddNewGroupPage() {
    return (
      <Route
        path="/dashboard/:id/versions/:versionId/groups/:groupId/pages/new"
        render={props => (
          <PageForm
            {...props}
            show={true}
            onHide={() => {
              this.props.history.push({
                pathname: "/dashboard"
              });
            }}
            title="Add new Group Page"
            versionId={this.props.location.versionId}
            groupId={this.props.location.groupId}
          />
        )}
      />
    );
  }

  routeToAddNewVersionPage() {
    return (
      <Route
        path="/dashboard/:id/versions/:versionId/pages/new"
        render={props => (
          <PageForm
            {...props}
            show={true}
            onHide={() => {
              this.props.history.push({
                pathname: "/dashboard"
              });
            }}
            title="Add New Version Page"
            versionId={this.props.location.versionId}
          />
        )}
      />
    );
  }

  routeToImportVersionForm() {
    return (
      <Route
        path="/dashboard/:collectionId/versions/import"
        render={props => (
          <ImportVersionForm
            {...props}
            show={true}
            onHide={() => {
              this.props.history.push({
                pathname: "/dashboard"
              });
            }}
            title="Import Version"
          />
        )}
      />
    );
  }

  routeToShareVersionForm() {
    return (
      <Route
        path="/dashboard/:collectionId/versions/:versionId/share"
        render={props => (
          <ShareVersionForm
            {...props}
            show={true}
            onHide={() => {
              this.props.history.push({
                pathname: "/dashboard"
              });
            }}
            title="Share Version"
          />
        )}
      />
    );
  }

  closeVersionForm() {
    this.setState({ showVersionForm: false });
  }

  render() {
    return (
      <div>
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
            <Switch>
              {this.routeToAddNewGroupPage()}
              {this.routeToAddNewVersionPage()}
              {this.routeToImportVersionForm()}
              {this.routeToShareVersionForm()}
            </Switch>
          </div>
        </div>
        <div
          style={{ display: "flex", flexDirection: "row", marginTop: "15px" }}
        >
          <div style={{ marginRight: "10px", marginTop: "5px" }}>
            <i class="fas fa-search"></i>
          </div>
          <input
            className="form-control form-control-dark w-100"
            type="text"
            placeholder="Filter"
            aria-label="Search"
          />
        </div>
        <Tabs
          style={{ paddingTop: 20 }}
          defaultActiveKey="Collections"
          id="uncontrolled-tab-example"
        >
          <Tab eventKey="History" title="History">
            History
          </Tab>
          <Tab eventKey="Collections" title="Collections">
            <div className="App-Side">
              <button
                className="btn btn-default btn-lg"
                onClick={() => this.openAddCollectionForm()}
              >
                + New Collection
              </button>
              {Object.keys(this.props.collections).map(
                (collectionId, index) => (
                  <Accordion key={collectionId}>
                    <Card>
                      <Card.Header>
                        <Accordion.Toggle
                          as={Button}
                          variant="link"
                          eventKey="1"
                        >
                          {this.props.collections[collectionId].name}
                        </Accordion.Toggle>
                        <DropdownButton
                          alignRight
                          title=""
                          id="dropdown-menu-align-right"
                          style={{ float: "right" }}
                        >
                          <Dropdown.Item
                            eventKey="1"
                            onClick={() =>
                              this.openEditCollectionForm(collectionId)
                            }
                          >
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            eventKey="0"
                            onClick={() => {
                              if (
                                window.confirm(
                                  "Are you sure you wish to delete this collection?" +
                                    "\n" +
                                    " All your versions, groups, pages and endpoints present in this collection will be deleted."
                                )
                              )
                                this.handleDelete(
                                  this.props.collections[collectionId]
                                );
                            }}
                          >
                            Delete
                          </Dropdown.Item>
                          <Dropdown.Item
                            eventKey="3"
                            onClick={() =>
                              this.openAddVersionForm(collectionId)
                            }
                          >
                            Add Version
                          </Dropdown.Item>
                          <Dropdown.Item
                            eventKey="3"
                            onClick={() =>
                              this.handleDuplicateCollection(
                                this.props.collections[collectionId]
                              )
                            }
                          >
                            Duplicate
                          </Dropdown.Item>
                          <Dropdown.Item
                            eventKey="3"
                            onClick={() =>
                              this.openImportVersionForm(collectionId)
                            }
                          >
                            Import Version
                          </Dropdown.Item>
                        </DropdownButton>
                      </Card.Header>
                      <Accordion.Collapse eventKey="1">
                        <Card.Body>
                          <CollectionVersions
                            {...this.props}
                            collection_id={collectionId}
                          />
                        </Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                )
              )}
            </div>
          </Tab>

          <Tab eventKey="Api" title="Api">
            Api
          </Tab>
        </Tabs>
      </div>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CollectionsComponent)
);
