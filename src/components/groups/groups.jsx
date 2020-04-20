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

const mapStateToProps = (state) => {
  return { groups: state.groups };
};

const mapDispatchToProps = (dispatch) => {
  return {
    deleteGroup: (group) => dispatch(deleteGroup(group)),
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
    this.props.history.push({
      pathname: "/dashboard",
    });
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
        }
      }
    }
    if (title === "pages") {
      this.filteredGroupPages = {};
      if (groupIds !== null) {
        for (let i = 0; i < groupIds.length; i++) {
          this.filteredGroupPages[groupIds[i]] = this.props.groups[groupIds[i]];
        }
      }
    }
    this.filteredEndpointsAndPages = this.jsonConcat(
      this.filteredEndpointsAndPages,
      this.filteredGroupPages
    );
    this.filteredEndpointsAndPages = this.jsonConcat(
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

  jsonConcat(o1, o2) {
    for (var key in o2) {
      o1[key] = o2[key];
    }
    return o1;
  }

  filterGroups() {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== "" &&
      this.filterFlag === false
    ) {
      this.filteredGroups = {};
      this.filterFlag = true;
      let groups = { ...this.props.groups };
      let groupIds = Object.keys(groups);
      let groupNameIds = [];
      let groupNames = [];
      for (let i = 0; i < groupIds.length; i++) {
        const { name } = groups[groupIds[i]];
        groupNameIds.push({ name: name, id: groupIds[i] });
        groupNames.push(name);
      }
      let finalGroupNames = groupNames.filter((name) => {
        return (
          name.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1
        );
      });
      let finalGroupIds = [];
      let uniqueIds = {};
      for (let i = 0; i < finalGroupNames.length; i++) {
        for (let j = 0; j < Object.keys(groupNameIds).length; j++) {
          if (
            finalGroupNames[i] === groupNameIds[j].name &&
            !uniqueIds[groupNameIds[j].id]
          ) {
            finalGroupIds.push(groupNameIds[j].id);
            uniqueIds[groupNameIds[j].id] = true;
            break;
          }
        }
      }
      for (let i = 0; i < finalGroupIds.length; i++) {
        this.filteredGroups[finalGroupIds[i]] = this.props.groups[
          finalGroupIds[i]
        ];
      }
      this.setState({ filter: this.props.filter });
      if (Object.keys(this.filteredGroups).length !== 0) {
        let versionIds = [];
        for (let i = 0; i < Object.keys(this.filteredGroups).length; i++) {
          versionIds.push(this.filteredGroups[finalGroupIds[i]].versionId);
        }
        this.props.show_filter_version(versionIds, "groups");
      } else {
        this.props.show_filter_version(null, "groups");
      }
    } else if (this.filterFlag === false) {
      this.filteredGroups = { ...this.props.groups };
    }
  }

  render() {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false;
    }
    if (this.filterFlag === false && this.props.filter === "") {
      this.eventkey = "1";
    } else {
      this.eventkey = "0";
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
            <Accordion
              key={groupId}
              id="child-accordion"
              defaultActiveKey="0"
              // draggable
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
                    eventKey={this.eventkey}
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
                            this.openShareGroupForm(this.props.groups[groupId])
                          }
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  ) : null}
                </Card.Header>
                <Accordion.Collapse eventKey={this.eventkey}>
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
          ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
