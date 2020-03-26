import React, { Component } from "react";
import { connect } from "react-redux";
import Endpoints from "../endpoints/endpoints";
import GroupForm from "../groups/groupForm";
import { deleteGroup, duplicateGroup } from "../groups/redux/groupsActions";
import ShareGroupForm from "../groups/shareGroupForm";
import GroupPages from "../pages/groupPages";
import PageForm from "../pages/pageForm";
import { isDashboardRoute } from "../common/utility";

const mapStateToProps = state => {
  return { groups: state.groups };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteGroup: group => dispatch(deleteGroup(group)),
    duplicateGroup: group => dispatch(duplicateGroup(group))
  };
};

class Groups extends Component {
  state = {
    GroupFormName: "",
    showGroupForm: {
      addPage: false,
      edit: false,
      share: false
    }
  };

  onDrop(destinationGroupId) {
    this.props.set_destination_group_id(destinationGroupId);
  }

  handleAddPage(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId
    });
  }

  handleAddEndpoint(groupId, versions, groups) {
    this.props.history.push({
      pathname: `/dashboard/endpoints`,
      versions: versions,
      groups: groups,
      groupId: groupId,
      title: "Add New Endpoint",
      groupFlag: true
    });
  }
  openShareGroupForm(group) {
    let showGroupForm = { share: true, addPage: false };
    this.setState({
      showGroupForm,
      groupFormName: "Share Group",
      selectedGroup: group
    });
  }
  handleDuplicate(group) {
    this.props.duplicateGroup(group);
    this.props.history.push({
      pathname: "/dashboard"
    });
  }

  handleDelete(group) {
    const confirm = window.confirm(
      "Are you sure you wish to delete this group? " +
        "\n" +
        "All your pages and endpoints present in this group will be deleted."
    );
    if (confirm) {
      this.props.deleteGroup(group);
      this.props.history.push({
        pathname: "/dashboard"
      });
    }
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
      selectedCollection
    });
  }
  openEditGroupForm(selectedGroup) {
    let showGroupForm = { edit: true };
    this.setState({
      showGroupForm,
      selectedGroup
    });
  }

  render() {
    return (
      <div>
        <div>
          {this.showShareGroupForm()}
          {this.showEditGroupForm()}
          {this.showAddGroupPageForm()}
        </div>
        {Object.keys(this.props.groups)
          .filter(
            gId => this.props.groups[gId].versionId === this.props.version_id
          )
          .map((groupId, index) => (
            <div id="accordion" key={index}>
              <div className="card">
                <div className="card-header" id="custom-card-header">
                  <i
                    className="fas fa-folder-open"
                    style={{ margin: "5px" }}
                  ></i>
                  <h5 className="mb-0">
                    <button
                      className="btn"
                      data-toggle="collapse"
                      data-target={`#${groupId}`}
                      aria-expanded="true"
                      aria-controls={groupId}
                    >
                      {this.props.groups[groupId].name}
                    </button>
                  </h5>
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
                          onClick={() =>
                            this.handleDelete(this.props.groups[groupId])
                          }
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
                </div>

                <div id={groupId} className="collapse">
                  <div className="card-body">
                    <GroupPages
                      {...this.props}
                      version_id={this.props.groups[groupId].versionId}
                      group_id={groupId}
                    />
                    <Endpoints
                      {...this.props}
                      group_id={groupId}
                      endpoints_order={
                        this.props.groups[groupId].endpointsOrder
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
