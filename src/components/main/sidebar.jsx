import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import Collections from "../collections/collections";
import ProtectedRoute from "../common/protectedRoute";
import { isDashboardRoute } from "../common/utility";
import { getCurrentUser } from "../auth/authService";
import CollectionVersions from "../collectionVersions/collectionVersions";
import endpointApiService from "../endpoints/endpointApiService";
import "./main.scss";
import "./sidebar.scss";
import { Tabs, Tab, Button } from 'react-bootstrap'
import LoginSignupModal from './loginSignupModal';
import indexedDbService from "../indexedDb/indexedDbService";
import hitmanIcon from "../../assets/icons/hitman.svg"
import collectionIcon from "../../assets/icons/collectionIcon.svg"
import historyIcon from "../../assets/icons/historyIcon.svg"
import randomTriggerIcon from "../../assets/icons/randomTriggerIcon.svg"
import emptyCollections from "../../assets/icons/emptyCollections.svg"
import collections from "../collections/collections";
import moment from 'moment';

const mapStateToProps = (state) => {
  return {
    collections: state.collections,
    // versions: state.versions,
    // pages: state.pages,
    // groups: state.groups,
    historySnapshot: state.history,
    filter: "",
  };
};

function compareByCreatedAt(a, b) {
  const t1 = a?.createdAt;
  const t2 = b?.createdAt;
  let comparison = 0;
  if (t1 < t2) {
    comparison = 1;
  } else if (t1 > t2) {
    comparison = -1;
  }
  return comparison;
}

class SideBar extends Component {
  state = {
    data: {
      filter: "",
    },
    name: "",
    email: "",
    historySnapshot: null
  };

  componentDidMount() {
    if (getCurrentUser()) {
      const user = getCurrentUser();
      console.log(user)
      const name = user.first_name + user.last_name;
      const email = user.email;
      this.setState({ name, email });
    }
    if (this.props.historySnapshot)
      this.setState({ historySnapshot: Object.values(this.props.historySnapshot) })
  }
  componentDidUpdate(prevProps, prevState) {
    if (this.props.historySnapshot != prevProps.historySnapshot) {
      this.setState({ historySnapshot: Object.values(this.props.historySnapshot) })
    }
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

  handleOnChange = (e) => {
    this.setState({ data: { ...this.state.data, filter: e.target.value } });
    let obj = Object.values(this.props.historySnapshot);
    if (e.target.value.length > 2) {
      if (this.props.historySnapshot) {
        obj = obj.filter(o => o.endpoint.name?.includes(e.target.value) || o.endpoint.BASE_URL?.includes(e.target.value) || o.endpoint.uri?.includes(e.target.value));
      }
    }
    this.setState({ historySnapshot: obj });
  };

  emptyFilter() {
    let data = { ...this.state.data };
    data.filter = "";
    this.setState({ data });
  }

  openCollection(collectionId) {
    this.collectionId = collectionId;
  }

  openApiForm() {
    this.setState({ showOpenApiForm: true });
  }

  closeOpenApiFormModal() {
    this.setState({ showOpenApiForm: false });
  }

  closeLoginSignupModal() {
    this.setState({
      showLoginSignupModal: false
    })
  }

  renderHistoryList() {
    return (
      this.state.historySnapshot && this.props.historySnapshot &&
      this.state.historySnapshot.sort(compareByCreatedAt).map(history => (
        Object.keys(history).length !== 0 &&
        <div className="btn d-flex align-items-center"
          onClick={() => { console.log(history.id) }}>
          <div
            className={`api-label ${history.endpoint.requestType}`}
          >
            <div className="endpoint-request-div">
              {history.endpoint.requestType}
            </div>
          </div>
          <div className="ml-3">
            <div>{history.endpoint.name || history.endpoint.BASE_URL + history.endpoint.uri || "Random Trigger"}</div>
            <small className="text-muted">{moment(history.createdAt).format("ddd, Do MMM h:mm a")}</small>
          </div>
        </div>
      ))
    )
  }
  setKeyWord() {
    return this.state.data.filter.length > 2 ? this.state.data.filter : "";
  }

  render() {
    return (
      <nav
        className={
          isDashboardRoute(this.props, true) ? "sidebar" : "public-endpoint-sidebar"
        }
      >
        {this.state.showLoginSignupModal && (
          <LoginSignupModal
            show={true}
            onHide={() => this.closeLoginSignupModal()}
            title="Add Collection"
          />
        )}
        <div className="primary-sidebar">
          {isDashboardRoute(this.props, true) ? (
            <React.Fragment>
              {/* <div className="user-info">
                <div className="user-avatar">
                  <i className="uil uil-user"></i>
                </div>
                <div className="user-details">
                  <div className="user-details-heading">
                    <div className="user-name">{this.state.name}</div>
                    <div className="user-settings-dropdown">
                      <div className="dropdown-toggle" data-toggle="dropdown">
                        <i className="uil uil-cog"></i>
                      </div>
                      <div className="dropdown-menu">
                        <a
                          className="dropdown-item"
                          onClick={() => this.openApiForm()}
                        >
                          Import open API
                        </a>
                        <Link className="dropdown-item" to="/logout">
                          Sign out
                        </Link>

                        {this.state.showOpenApiForm &&
                          this.state.showOpenApiForm === true && (
                            <OpenApiForm
                              {...this.props}
                              show={true}
                              onHide={() => this.closeOpenApiFormModal()}
                              title="IMPORT API"
                            ></OpenApiForm>
                          )}
                      </div>
                    </div>
                  </div>
                  <div className="user-details-text">{this.state.email}</div>
                </div>
              </div> */}

              <div className="app-name"><img className="icon" src={hitmanIcon}></img>HITMAN</div>
              <div className="search-box">
                <i className="fas fa-search" id="search-icon"></i>
                <input
                  value={this.state.data.filter}
                  type="text"
                  name="filter"
                  placeholder="Search"
                  onChange={(e) => this.handleOnChange(e)}
                />
              </div>

              <Tabs defaultActiveKey={getCurrentUser() ? "collection" : "randomTrigger"} id="uncontrolled-tab-example">
                <Tab eventKey="collection" title={
                  <img src={collectionIcon}></img>
                } >
                  {!getCurrentUser() ? (
                    <div className="empty-collections">
                      <div> <img src={emptyCollections}></img></div>
                      <div className="content">
                        Your collection is Empty.
                        <br></br>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      </div>
                      <Button className="button" variant="warning" onClick={() => this.setState({
                        showLoginSignupModal: true
                      })
                      }
                      >+ Add here</Button>{' '}
                    </div>) : null}
                  {getCurrentUser() ? (
                    <Switch>
                      <ProtectedRoute
                        path="/dashboard/"
                        render={(props) => (
                          <Collections
                            {...this.props}
                            empty_filter={this.emptyFilter.bind(this)}
                            collection_selected={this.openCollection.bind(this)}
                            filter={this.setKeyWord()}
                          />
                        )}
                      />
                      <ProtectedRoute
                        path="/admin/publish"
                        render={(props) => (
                          <Collections
                            {...this.props}
                            empty_filter={this.emptyFilter.bind(this)}
                            collection_selected={this.openCollection.bind(this)}
                            filter={this.state.data.filter}
                          />
                        )}
                      />

                    </Switch>) : null}
                  {isDashboardRoute(this.props, true) ? (
                    <React.Fragment></React.Fragment>
                  ) : null}
                </Tab>
                <Tab eventKey="history" title={<img src={historyIcon}></img>}>
                  {this.renderHistoryList()}
                </Tab>
                <Tab eventKey="randomTrigger" title={<img src={randomTriggerIcon}></img>
                } >
                </Tab>
              </Tabs>
            </React.Fragment>
          ) : <Route
              path="/p/:collectionId"
              render={(props) => <Collections {...this.props} />}
            />}

        </div>
        {
          this.collectionId && (
            <div className="secondary-sidebar">
              <CollectionVersions
                {...this.props}
                collection_id={this.collectionId}
              />
            </div>
          )
        }
      </nav >
    );
  }
}

// export default SideBar;
export default withRouter(connect(mapStateToProps)(SideBar));
