import React, { Component } from "react";
import { Accordion, Card } from "react-bootstrap";
import { connect } from "react-redux";
import { isDashboardRoute } from "../common/utility";
import Endpoints from "../endpoints/endpoints";
import GroupForm from "../groups/groupForm";
import {
  deleteGroup,
  duplicateGroup,
  updateGroupOrder,
} from "../groups/redux/groupsActions";
import ShareGroupForm from "../groups/shareGroupForm";
import GroupPages from "../pages/groupPages";
import PageForm from "../pages/pageForm";
import tabService from "../tabs/tabService";
import "./groups.scss";
import groupsService from "./groupsService";
import filterService from "../../services/filterService";

const mapStateToProps = (state) => {
  return { groups: state.groups, pages: state.pages };
};

const mapDispatchToProps = (dispatch) => {
  return {
    update_groups_order: (groupIds, versionId) =>
      dispatch(updateGroupOrder(groupIds, versionId)),
    delete_group: (group, props) => dispatch(deleteGroup(group, props)),
    duplicate_group: (group) => dispatch(duplicateGroup(group)),
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

  onDrop(e, destinationGroupId) {
    e.preventDefault();
    if (this.endpointDrag === true) {
      this.endpointDrag = false;
      this.props.set_destination_group_id(destinationGroupId);
    } else {
      if (!this.draggedItem) {
      } else {
        if (this.draggedItem === destinationGroupId) {
          this.draggedItem = null;
          return;
        }
        const groups = this.extractGroups();
        const positionWisegroups = this.makePositionWisegroups({ ...groups });
        const index = positionWisegroups.findIndex(
          (eId) => eId === destinationGroupId
        );
        let groupIds = positionWisegroups.filter(
          (item) => item !== this.draggedItem
        );
        groupIds.splice(index, 0, this.draggedItem);
        let gps = {};
        for (let index = 0; index < groupIds.length; index++) {
          gps[index] = this.props.groups[groupIds[index]];
        }
        console.log("gp", gps);
        this.props.update_groups_order(groupIds, this.props.version_id);
        this.draggedItem = null;
      }
    }
  }

  makePositionWisegroups(groups) {
    let positionWisegroups = [];
    for (let i = 0; i < Object.keys(groups).length; i++) {
      positionWisegroups[groups[Object.keys(groups)[i]].position] = Object.keys(
        groups
      )[i];
    }
    return positionWisegroups;
  }

  extractGroups() {
    let groups = {};
    for (let i = 0; i < Object.keys(this.props.groups).length; i++) {
      if (
        this.props.groups[Object.keys(this.props.groups)[i]].versionId ===
        this.props.version_id
      ) {
        groups[Object.keys(this.props.groups)[i]] = this.props.groups[
          Object.keys(this.props.groups)[i]
        ];
      }
    }
    return groups;
  }

  handleAddPage(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId,
    });
  }

  handleAddEndpoint(groupId, versions, groups) {
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
    this.props.duplicate_group(group);
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
    this.filterGroups();
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
    this.filteredEndpointsAndPages = filterService.jsonConcat(
      this.filteredEndpointsAndPages,
      this.filteredOnlyGroups
    );
    let versionIds = [];
    if (Object.keys(this.filteredEndpointsAndPages).length !== 0) {
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
        } else {
          delete this.filteredEndpointsAndPages[
            Object.keys(this.filteredEndpointsAndPages)[i]
          ];
        }
      }
    }
    if (Object.keys(this.filteredEndpointsAndPages).length === 0) {
      this.props.show_filter_version(null, "endpointsAndPages");
    } else {
      this.props.show_filter_version(versionIds, "endpointsAndPages");
    }
    this.groups = this.filteredEndpointsAndPages;
  }

  filterGroups() {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== "" &&
      this.filterFlag === false
    ) {
      this.filterFlag = true;
      let groupIds = [];
      this.filteredOnlyGroups = {};
      groupIds = filterService.filter(
        this.props.groups,
        this.props.filter,
        "groups"
      );
      this.setState({ filter: this.props.filter });
      if (groupIds.length !== 0) {
        for (let i = 0; i < groupIds.length; i++) {
          this.filteredOnlyGroups[groupIds[i]] = this.props.groups[groupIds[i]];
        }
      }
    } else {
      this.filteredOnlyGroups = {};
    }
  }

  onDragStart = (e, gId) => {
    this.draggedItem = gId;
  };

  setEndpointdrag() {
    this.endpointDrag = true;
  }
  setPagedrag() {
    this.pageDrag = true;
  }

  renderBody(groupId) {
    if (
      isDashboardRoute(this.props) &&
      document.getElementsByClassName("group-collapse")
    ) {
      if (this.props.filter !== "" && this.eventkey[groupId] === "0") {
        let elements = document.getElementsByClassName("group-collapse");
        for (let i = 0; i < elements.length; i++) {
          elements[i].className = "group-collapse collapse show";
        }
      } else if (this.props.filter !== "") {
        let elements = document.getElementsByClassName("group-collapse");
        for (let i = 0; i < elements.length; i++) {
          elements[i].className = "group-collapse collapse hide";
        }
      }
    }

    return (
      <React.Fragment>
        {isDashboardRoute(this.props) ? (
          <Accordion
            key={groupId}
            className="sidebar-accordion"
            id="child-accordion"
            defaultActiveKey={
              this.eventkey[groupId] ? this.eventkey[groupId] : "1"
            }
            draggable
            onDragStart={(e) => this.onDragStart(e, groupId)}
            onDragOver={(e) => {
              e.preventDefault();
            }}
            onDrop={(e) => this.onDrop(e, groupId)}
          >
            {/* <Card> */}
            {/* <Card.Header> */}
            <Accordion.Toggle
              variant="default"
              // eventKey="0"
              eventKey={
                !isDashboardRoute(this.props)
                  ? "0"
                  : this.eventkey[groupId]
                  ? this.eventkey[groupId]
                  : "1"
              }
            >
              <div className="sidebar-accordion-item">
                <i className="uil uil-folder"></i>
                {this.props.groups[groupId].name}
              </div>
              {isDashboardRoute(this.props) ? (
                <div className="sidebar-item-action">
                  <div
                    className="sidebar-item-action-btn"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i className="uil uil-ellipsis-v"></i>
                  </div>
                  <div className="dropdown-menu dropdown-menu-right">
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        this.openEditGroupForm(this.props.groups[groupId])
                      }
                    >
                      Edit
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() => {
                        this.openDeleteGroupModal(groupId);
                      }}
                    >
                      Delete
                    </a>
                    <a
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
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        this.handleDuplicate(this.props.groups[groupId])
                      }
                    >
                      Duplicate
                    </a>
                    <a
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
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        this.openShareGroupForm(this.props.groups[groupId])
                      }
                    >
                      Share
                    </a>
                  </div>
                </div>
              ) : null}
            </Accordion.Toggle>
            {/* </Card.Header> */}
            <Accordion.Collapse
              className="group-collapse"
              // eventKey="0"
              eventKey={
                !isDashboardRoute(this.props)
                  ? "0"
                  : this.eventkey[groupId]
                  ? this.eventkey[groupId]
                  : "1"
              }
            >
              <Card.Body>
                <GroupPages
                  {...this.props}
                  version_id={this.props.groups[groupId].versionId}
                  set_page_drag={this.setPagedrag.bind(this)}
                  group_id={groupId}
                  show_filter_groups={this.propsFromGroups.bind(this)}
                />
                <Endpoints
                  {...this.props}
                  group_id={groupId}
                  set_endpoint_drag={this.setEndpointdrag.bind(this)}
                  endpoints_order={this.props.groups[groupId].endpointsOrder}
                  show_filter_groups={this.propsFromGroups.bind(this)}
                />
              </Card.Body>
            </Accordion.Collapse>
            {/* </Card> */}
          </Accordion>
        ) : (
          <div className="hm-sidebar-block">
            <div className="hm-sidebar-label">
              {this.props.groups[groupId].name}
            </div>
            <GroupPages
              {...this.props}
              version_id={this.props.groups[groupId].versionId}
              group_id={groupId}
              show_filter_groups={this.propsFromGroups.bind(this)}
            />
            <Endpoints
              {...this.props}
              group_id={groupId}
              endpoints_order={this.props.groups[groupId].endpointsOrder}
              show_filter_groups={this.propsFromGroups.bind(this)}
            />
          </div>
        )}
      </React.Fragment>
    );
  }
  render() {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false;
    }
    if (this.filterFlag === false && this.props.filter === "") {
      this.eventkey = {};
    }
    if (!this.props.filter || this.props.filter === "") {
      this.groups = { ...this.props.groups };
    }

    if (this.groups && Object.keys(this.groups)) {
      this.sortedGroups = Object.keys(this.groups)
        .map((gId) => this.groups[gId])
        .sort(function (a, b) {
          return a.position - b.position;
        });
    }

    return (
      <div>
        <div>
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
        {this.sortedGroups &&
          this.sortedGroups
            .filter((group) => group.versionId === this.props.version_id)
            .map((group) =>
              group.id ? <div>{this.renderBody(group.id)}</div> : null
            )}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
