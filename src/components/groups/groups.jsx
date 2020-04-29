import React, { Component } from "react";
import { Accordion, Button, Card } from "react-bootstrap";
import { connect } from "react-redux";
import { isDashboardRoute } from "../common/utility";
import Endpoints from "../endpoints/endpoints";
import GroupForm from "../groups/groupForm";
import { deleteGroup, duplicateGroup } from "../groups/redux/groupsActions";
import ShareGroupForm from "../groups/shareGroupForm";
import GroupPages from "../pages/groupPages";
import PageForm from "../pages/pageForm";
import tabService from "../tabs/tabService";
import "./groups.scss";
import groupsService from "./groupsService";
import filterService from "../common/filterService";

const mapStateToProps = (state) => {
  return { groups: state.groups };
};

const mapDispatchToProps = (dispatch) => {
  return {
    deleteGroup: (group, props) => dispatch(deleteGroup(group, props)),
    duplicateGroup: (group) => dispatch(duplicateGroup(group)),
  };
};

class Groups extends Component {
  state = {
    GroupFormName: "",
    showGroupForm: {
      addPage: false,
      edit: false,
      share: false,
    },
    filter: "",
  };
  eventkey = {};
  filterFlag = false;
  filteredGroupEndpoints = {};
  filteredGroupPages = {};
  filteredEndpointsAndPages = {};

  onDrop(destinationGroupId) {
    this.props.set_destination_group_id(destinationGroupId);
  }

  handleAddPage(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId,
    });
  }

  handleAddEndpoint(groupId, versions, groups) {
    // const newTabId = shortId.generate();
    // const tabs = [
    //   ...this.props.tabs,
    //   { id: newTabId, type: "endpoint", isSaved: false },
    // ];

    // this.props.set_tabs(tabs, tabs.length - 1);
    tabService.newTab({ ...this.props });
    this.props.history.push({
      pathname: `/dashboard/endpoint/new`,
      groupId: groupId,
      title: "Add New Endpoint",
    });
  }

  openShareGroupForm(group) {
    let showGroupForm = { share: true, addPage: false };
    this.setState({
      showGroupForm,
      groupFormName: "Share Group",
      selectedGroup: group,
    });
  }

  handleDuplicate(group) {
    this.props.duplicateGroup(group);
  }

  closeGroupForm() {
    let edit = false;
    let addPage = false;
    let showGroupForm = { edit, addPage };
    this.setState({ showGroupForm });
  }
  showEditGroupForm() {
    return (
      this.state.showGroupForm.edit && (
        <GroupForm
          {...this.props}
          show={this.state.showGroupForm.edit}
          onHide={() => this.closeGroupForm()}
          selected_group={this.state.selectedGroup}
          title="Edit Group"
        />
      )
    );
  }

  showAddGroupPageForm() {
    return (
      this.state.showGroupForm.addPage && (
        <PageForm
          {...this.props}
          show={this.state.showGroupForm.addPage}
          onHide={() => this.closeGroupForm()}
          title={this.state.groupFormName}
          selectedVersion={this.state.selectedVersion}
          selectedGroup={this.state.selectedGroup}
          selectedCollection={this.state.selectedCollection}
        />
      )
    );
  }
  showShareGroupForm() {
    return (
      this.state.showGroupForm.share && (
        <ShareGroupForm
          show={this.state.showGroupForm.share}
          onHide={() => this.closeGroupForm()}
          title={this.state.groupFormName}
          selectedGroup={this.state.selectedGroup}
        />
      )
    );
  }
  openGroupPageForm(selectedVersion, selectedGroup, selectedCollection) {
    let showGroupForm = { addPage: true };
    this.setState({
      showGroupForm,
      groupFormName: "Add new Group Page",
      selectedVersion,
      selectedGroup,
      selectedCollection,
    });
  }

  openEditGroupForm(selectedGroup) {
    let showGroupForm = { edit: true };
    this.setState({
      showGroupForm,
      selectedGroup,
    });
  }

  openDeleteGroupModal(groupId) {
    this.setState({
      showDeleteModal: true,
      selectedGroup: {
        ...this.props.groups[groupId],
      },
    });
  }

  closeDeleteGroupModal() {
    this.setState({ showDeleteModal: false });
  }

  propsFromGroups(groupIds, title) {
    this.filteredEndpointsAndPages = {};
    if (title === "endpoints") {
      this.filteredGroupEndpoints = {};
      if (groupIds !== null) {
        for (let i = 0; i < groupIds.length; i++) {
          this.filteredGroupEndpoints[groupIds[i]] = this.props.groups[
            groupIds[i]
          ];
          this.eventkey[groupIds[i]] = "0";
        }
      }
    }
    if (title === "pages") {
      this.filteredGroupPages = {};
      if (groupIds !== null) {
        for (let i = 0; i < groupIds.length; i++) {
          this.filteredGroupPages[groupIds[i]] = this.props.groups[groupIds[i]];
          this.eventkey[groupIds[i]] = "0";
        }
      }
    }
    this.filteredEndpointsAndPages = filterService.jsonConcat(
      this.filteredEndpointsAndPages,
      this.filteredGroupPages
    );
    this.filteredEndpointsAndPages = filterService.jsonConcat(
      this.filteredEndpointsAndPages,
      this.filteredGroupEndpoints
    );
    let versionIds = [];
    for (
      let i = 0;
      i < Object.keys(this.filteredEndpointsAndPages).length;
      i++
    ) {
      if (Object.keys(this.filteredEndpointsAndPages)[i] !== "null") {
        versionIds.push(
          this.filteredEndpointsAndPages[
            Object.keys(this.filteredEndpointsAndPages)[i]
          ].versionId
        );
      }
    }
    if (Object.keys(this.filteredEndpointsAndPages).length === 0) {
      this.props.show_filter_version(null, "endpointsAndPages");
    } else {
      this.props.show_filter_version(versionIds, "endpointsAndPages");
    }
  }

  filterGroups() {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== "" &&
      this.filterFlag === false
    ) {
      this.filterFlag = true;
      let versionIds = [];
      versionIds = filterService.filter(
        this.props.groups,
        this.props.filter,
        "groups"
      );
      this.setState({ filter: this.props.filter });
      if (versionIds.length !== 0) {
        this.props.show_filter_version(versionIds, "groups");
      } else {
        this.props.show_filter_version(null, "groups");
      }
    }
  }

  render() {
    if (document.getElementsByClassName("group-collapse")) {
      if (this.props.filter !== "") {
        let elements = document.getElementsByClassName("group-collapse");
        for (let i = 0; i < elements.length; i++) {
          elements[i].className = "group-collapse collapse show";
        }
      } else if (this.props.filter === "") {
        let elements = document.getElementsByClassName("group-collapse");
        for (let i = 0; i < elements.length; i++) {
          elements[i].className = "group-collapse collapse hide";
        }
      }
    }
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false;
    }
    if (this.filterFlag === false && this.props.filter === "") {
      this.eventkey = {};
    }
    return (
      <div>
        <div>
          {this.filterGroups()}
          {this.showShareGroupForm()}
          {this.showEditGroupForm()}
          {this.showAddGroupPageForm()}
          {this.state.showDeleteModal &&
            groupsService.showDeleteGroupModal(
              this.props,
              this.closeDeleteGroupModal.bind(this),
              "Delete Group",
              `Are you sure you wish to delete this group?
              All your pages and endpoints present in this group will be deleted.`,
              this.state.selectedGroup
            )}
        </div>
        {Object.keys(this.props.groups)
          .filter(
            (gId) => this.props.groups[gId].versionId === this.props.version_id
          )
          .map((groupId, index) => (
            <div>
              <Accordion
                key={groupId}
                id="child-accordion"
                defaultActiveKey="0"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => this.onDrop(groupId)}
              >
                <Card>
                  <Card.Header>
                    <i
                      className="fas fa-folder-open"
                      style={{ margin: "5px" }}
                    ></i>
                    <Accordion.Toggle
                      as={Button}
                      variant="default"
                      eventKey={
                        this.eventkey[groupId] ? this.eventkey[groupId] : "1"
                      }
                    >
                      {this.props.groups[groupId].name}
                    </Accordion.Toggle>
                    {isDashboardRoute(this.props) ? (
                      <div className="btn-group">
                        <button
                          className="btn btn-secondary "
                          data-toggle="dropdown"
                          aria-haspopup="true"
                          aria-expanded="false"
                        >
                          <i className="fas fa-ellipsis-h"></i>
                        </button>
                        <div className="dropdown-menu dropdown-menu-right">
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              this.openEditGroupForm(this.props.groups[groupId])
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() => {
                              this.openDeleteGroupModal(groupId);
                            }}
                          >
                            Delete
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              this.handleAddEndpoint(
                                groupId,
                                this.props.versions,
                                this.props.groups
                              )
                            }
                          >
                            Add Endpoint
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              this.handleDuplicate(this.props.groups[groupId])
                            }
                          >
                            Duplicate
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              this.openGroupPageForm(
                                this.props.groups[groupId].versionId,
                                this.props.groups[groupId],
                                this.props.collection_id
                              )
                            }
                          >
                            Add Page
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              this.openShareGroupForm(
                                this.props.groups[groupId]
                              )
                            }
                          >
                            Share
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </Card.Header>
                  <Accordion.Collapse
                    className="group-collapse"
                    eventKey={
                      this.eventkey[groupId] ? this.eventkey[groupId] : "1"
                    }
                  >
                    <Card.Body>
                      <GroupPages
                        {...this.props}
                        version_id={this.props.groups[groupId].versionId}
                        group_id={groupId}
                        show_filter_groups={this.propsFromGroups.bind(this)}
                      />
                      <Endpoints
                        {...this.props}
                        group_id={groupId}
                        endpoints_order={
                          this.props.groups[groupId].endpointsOrder
                        }
                        show_filter_groups={this.propsFromGroups.bind(this)}
                      />
                    </Card.Body>
                  </Accordion.Collapse>
                </Card>
              </Accordion>
            </div>
          ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
