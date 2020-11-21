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
import hitmanIcon from "../../assets/icons/hitman.svg"
import collectionIcon from "../../assets/icons/collectionIcon.svg"
import historyIcon from "../../assets/icons/historyIcon.svg"
import randomTriggerIcon from "../../assets/icons/randomTriggerIcon.svg"

const mapStateToProps = (state) => {
  return {
    // teams: state.teams,
    collections: state.collections,
    // versions: state.versions,
    // pages: state.pages,
    // teamUsers: state.teamUsers,
    // groups: state.groups,
    filter: "",
  };
};

class SideBar extends Component {
  state = {
    data: {
      filter: "",
    },
    name: "",
    email: "",
  };

  componentDidMount() {
    if (getCurrentUser()) {
      const { user } = getCurrentUser();
      const name = user.first_name + user.last_name;
      const email = user.email;
      this.setState({ name, email });
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

  handleChange = (e) => {
    let data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
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

  render() {
    return (
      <nav
        className={
          isDashboardRoute(this.props) ? "sidebar" : "public-endpoint-sidebar"
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
          {isDashboardRoute(this.props) ? (
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
                  onChange={this.handleChange}
                />
              </div>

              <Tabs defaultActiveKey={getCurrentUser() ? "collection" : "randomTrigger"} id="uncontrolled-tab-example">
                <Tab eventKey="collection" title={
                  <img src={collectionIcon}></img>
                } >
                  {!getCurrentUser() ? (<div>
                    Your collection is Empty.
                    <br></br>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    <Button variant="warning" onClick={() => this.setState({
                      showLoginSignupModal: true
                    })
                    }
                    >+ Add here</Button>{' '}
                  </div>) : null}
                </Tab>
                <Tab eventKey="history" title={<img src={historyIcon}></img>

                }>
                </Tab>
                <Tab eventKey="randomTrigger" title={<img src={randomTriggerIcon}></img>
                } >
                </Tab>
              </Tabs>
            </React.Fragment>
          ) : null}
          {getCurrentUser() ? (
            <Switch>
              <ProtectedRoute
                path="/dashboard/"
                render={(props) => (
                  <Collections
                    {...this.props}
                    empty_filter={this.emptyFilter.bind(this)}
                    collection_selected={this.openCollection.bind(this)}
                    filter={this.state.data.filter}
                  />
                )}
              />
              <Route
                path="/p/:collectionId"
                render={(props) => <Collections {...this.props} />}
              />
            </Switch>) : null}
          {isDashboardRoute(this.props) ? (
            <React.Fragment></React.Fragment>
          ) : null}
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
