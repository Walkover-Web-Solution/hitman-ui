import React, { Component } from "react";
import { Accordion, Card } from "react-bootstrap";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import CollectionVersionForm from "../collectionVersions/collectionVersionForm";
import {
  deleteVersion,
  duplicateVersion,
} from "../collectionVersions/redux/collectionVersionsActions";
import ShareVersionForm from "../collectionVersions/shareVersionForm";
import { isDashboardRoute } from "../common/utility";
import GroupForm from "../groups/groupForm";
import Groups from "../groups/groups";
import PageForm from "../pages/pageForm";
import VersionPages from "../pages/versionPages";
import "./collectionVersions.scss";
import collectionVersionsService from "./collectionVersionsService";
import filterService from "../../services/filterService";

const mapStateToProps = (state) => {
  return {
    versions: state.versions,
    groups: state.groups,
    pages: state.pages,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    delete_version: (version, props) => dispatch(deleteVersion(version, props)),
    duplicate_version: (version) => dispatch(duplicateVersion(version)),
  };
};

class CollectionVersions extends Component {
  state = {
    showShareVersionForm: false,
    versionFormName: "",
    selectedVersion: {},
    showVersionForm: {
      addGroup: false,
      addPage: false,
      share: false,
      edit: false,
    },
    filter: "",
  };

  filterFlag = false;
  eventkey = {};
  filteredGroups = {};
  filteredEndpointsAndPages = {};
  filteredVersionPages = {};
  filteredOnlyVersions = {};

  handleUpdate(collectionVersion) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${collectionVersion.id}/edit`,
      editCollectionVersion: collectionVersion,
    });
  }

  handleAddPage(versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/${collectionId}/versions/${versionId}/pages/new`,
      versionId: versionId,
    });
  }

  handleDuplicate(version) {
    this.props.duplicate_version(version);
  }

  showAddVersionPageForm() {
    return (
      this.state.showVersionForm.addPage && (
        <PageForm
          {...this.props}
          show={this.state.showVersionForm.addPage}
          onHide={() => this.closeVersionForm()}
          title={this.state.versionFormName}
          selectedVersion={this.state.selectedVersion}
        />
      )
    );
  }
  openShareVersionForm(version) {
    let showVersionForm = { share: true };
    this.setState({
      showVersionForm,
      versionFormName: "Share Version",
      selectedVersion: version,
    });
  }
  openAddVersionPageForm(version) {
    let showVersionForm = { addPage: true };
    this.setState({
      showVersionForm,
      versionFormName: "Add New Version Page",
      selectedVersion: version,
    });
  }
  openAddGroupForm(version) {
    let showVersionForm = { addGroup: true };
    this.setState({
      showVersionForm,
      versionFormName: "Add new Group",
      selectedVersion: version,
    });
  }

  openEditVersionForm(version) {
    this.setState({
      showCollectionForm: true,
      selectedVersion: version,
    });
  }

  openDeleteVersionModal(versionId) {
    this.setState({
      showDeleteModal: true,
      selectedVersion: {
        ...this.props.versions[versionId],
      },
    });
  }

  showShareVersionForm() {
    return (
      this.state.showVersionForm.share && (
        <ShareVersionForm
          show={this.state.showVersionForm.share}
          onHide={() => this.closeVersionForm()}
          title={this.state.versionFormName}
          selectedVersion={this.state.selectedVersion}
        />
      )
    );
  }

  showAddGroupForm() {
    return (
      this.state.showVersionForm.addGroup && (
        <GroupForm
          {...this.props}
          show={this.state.showVersionForm.addGroup}
          onHide={() => this.closeVersionForm()}
          title={this.state.versionFormName}
          selectedVersion={this.state.selectedVersion}
        />
      )
    );
  }
  showEditVersionForm() {
    return (
      this.state.showCollectionForm && (
        <CollectionVersionForm
          {...this.props}
          show={true}
          onHide={() => {
            this.setState({ showCollectionForm: false });
          }}
          title="Edit Collection Version"
          selected_version={this.state.selectedVersion}
        />
      )
    );
  }

  closeVersionForm() {
    let showVersionForm = { share: false, addGroup: false, addPage: false };
    this.setState({ showVersionForm });
  }

  closeDeleteVersionModal() {
    this.setState({ showDeleteModal: false });
  }

  propsFromVersion(versionIds, title) {
    this.filteredVersions = {};
    this.filterFlag = false;
    this.filterVersions();
    if (title === "groups") {
      this.filteredGroups = {};
      if (versionIds !== null) {
        for (let i = 0; i < versionIds.length; i++) {
          this.filteredGroups[versionIds[i]] = this.props.versions[
            versionIds[i]
          ];
          this.eventkey[versionIds[i]] = "0";
        }
      }
    }
    if (title === "endpointsAndPages") {
      this.filteredEndpointsAndPages = {};
      if (versionIds !== null) {
        for (let i = 0; i < versionIds.length; i++) {
          this.filteredEndpointsAndPages[versionIds[i]] = this.props.versions[
            versionIds[i]
          ];
          this.eventkey[versionIds[i]] = "0";
        }
      }
    }
    if (title === "versionPages") {
      this.filteredVersionPages = {};
      if (versionIds !== null) {
        for (let i = 0; i < versionIds.length; i++) {
          this.filteredVersionPages[versionIds[i]] = this.props.versions[
            versionIds[i]
          ];
          this.eventkey[versionIds[i]] = "0";
        }
      }
    }
    this.filteredVersions = filterService.jsonConcat(
      this.filteredVersions,
      this.filteredVersionPages
    );
    this.filteredVersions = filterService.jsonConcat(
      this.filteredVersions,
      this.filteredEndpointsAndPages
    );
    this.filteredVersions = filterService.jsonConcat(
      this.filteredVersions,
      this.filteredGroups
    );
    this.filteredVersions = filterService.jsonConcat(
      this.filteredVersions,
      this.filteredOnlyVersions
    );

    this.setState({ filter: this.props.filter });
  }

  filterVersions() {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== "" &&
      this.filterFlag === false
    ) {
      this.filteredOnlyVersions = {};
      this.filterFlag = true;
      let versionIds = [];
      versionIds = filterService.filter(
        this.props.versions,
        this.props.filter,
        "versions"
      );
      this.setState({ filter: this.props.filter });
      if (versionIds.length !== 0) {
        for (let i = 0; i < versionIds.length; i++) {
          this.filteredOnlyVersions[versionIds[i]] = this.props.versions[
            versionIds[i]
          ];
          if (
            !this.eventkey[versionIds[i]] ||
            this.eventkey[versionIds[i]] !== "0"
          ) {
            this.eventkey[versionIds[i]] = "1";
          }
        }
      } else {
        this.filteredOnlyVersions = {};
      }
    }
  }

  renderBody(versionId, index) {
    if (
      isDashboardRoute(this.props) &&
      document.getElementsByClassName("version-collapse")
    ) {
      if (this.props.filter !== "" && this.eventkey[versionId] === "0") {
        let elements = document.getElementsByClassName("version-collapse");
        for (let i = 0; i < elements.length; i++) {
          elements[i].className = "version-collapse collapse show";
        }
      } else if (this.props.filter !== "") {
        let elements = document.getElementsByClassName("version-collapse");
        for (let i = 0; i < elements.length; i++) {
          elements[i].className = "version-collapse collapse hide";
        }
      }
    }
    return (
      <React.Fragment>
        {isDashboardRoute(this.props) ? (
          <Accordion
            className="sidebar-accordion"
            defaultActiveKey={index === 0 ? this.eventkey[versionId] : null}
            key={versionId}
            id="child-accordion"
          >
            {/* <Card> */}
            {/* <Card.Header> */}
            <Accordion.Toggle
              variant="default"
              eventKey = "1"
              // eventKey={
              //   !isDashboardRoute(this.props) ? "0" : this.eventkey[versionId]
              // }
            >
              <div className="sidebar-accordion-item">
                <i className="uil uil-folder"></i>
                {this.props.versions[versionId].number}
              </div>
              {isDashboardRoute(this.props) ? (
                <div className="sidebar-item-action">
                  <div
                    className="sidebar-item-action-btn"
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <i className="uil uil-ellipsis-v"></i>
                  </div>
                  <div className="dropdown-menu dropdown-menu-right">
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        this.openEditVersionForm(this.props.versions[versionId])
                      }
                    >
                      Edit
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() => {
                        this.openDeleteVersionModal(versionId);
                      }}
                    >
                      Delete
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        this.openAddGroupForm(this.props.versions[versionId])
                      }
                    >
                      Add Group
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() => {
                        this.handleDuplicate(this.props.versions[versionId]);
                      }}
                    >
                      Duplicate
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        this.openAddVersionPageForm(
                          this.props.versions[versionId]
                        )
                      }
                    >
                      Add Page
                    </a>
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        this.openShareVersionForm(
                          this.props.versions[versionId]
                        )
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
              className="version-collapse"
              eventKey = "1"
              // eventKey={
              //   !isDashboardRoute(this.props) ? "0" : this.eventkey[versionId]
              // }
            >
              <Card.Body>
                <VersionPages
                  {...this.props}
                  version_id={versionId}
                  show_filter_version={this.propsFromVersion.bind(this)}
                />
                <Groups
                  {...this.props}
                  version_id={versionId}
                  show_filter_version={this.propsFromVersion.bind(this)}
                />
              </Card.Body>
            </Accordion.Collapse>
            {/* </Card> */}
          </Accordion>
        ) : (
          <React.Fragment>
            <VersionPages
              {...this.props}
              version_id={versionId}
              show_filter_version={this.propsFromVersion.bind(this)}
            />
            <Groups
              {...this.props}
              version_id={versionId}
              show_filter_version={this.propsFromVersion.bind(this)}
            />
          </React.Fragment>
        )}
      </React.Fragment>
    );
  }
  render() {
    if (
      this.filterFlag === false ||
      this.props.filter === "" ||
      this.state.filter !== this.props.filter
    ) {
      this.filteredVersions = { ...this.props.versions };
      this.eventkey = {};
    }
    return (
      <React.Fragment>
        {this.showShareVersionForm()}
        {this.showAddGroupForm()}
        {this.showEditVersionForm()}
        {this.showAddVersionPageForm()}
        {this.state.showDeleteModal &&
          collectionVersionsService.showDeleteVersionModal(
            this.props,
            this.closeDeleteVersionModal.bind(this),
            "Delete Version",
            `Are you sure you want to delete this versions?
        All your groups, pages and endpoints present in this version will be deleted.`,
            this.state.selectedVersion
          )}

        {!isDashboardRoute(this.props) ? (
          <div className="hm-sidebar-label">Introduction</div>
        ) : null}

        {this.filteredVersions &&
          Object.keys(this.filteredVersions) &&
          Object.keys(this.filteredVersions)
            .filter(
              (versionId) =>
                this.filteredVersions[versionId].collectionId ===
                this.props.collection_id
            )
            .map((versionId, index) => (
              <div>{this.renderBody(versionId, index)}</div>
            ))}
      </React.Fragment>
    );
  }
}

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(CollectionVersions)
);
