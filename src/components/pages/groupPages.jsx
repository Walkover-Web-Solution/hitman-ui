import React, { Component } from "react";
import { connect } from "react-redux";
import { deletePage, duplicatePage } from "./redux/pagesActions";
import { isDashboardRoute } from "../common/utility";
import {
  approvePage,
  draftPage,
  pendingPage,
  rejectPage
} from "../publicEndpoint/redux/publicEndpointsActions";

const mapStateToProps = state => {
  return {
    pages: state.pages
  };
};

const mapDispatchToProps = dispatch => {
  return {
    deletePage: page => dispatch(deletePage(page)),
    duplicatePage: page => dispatch(duplicatePage(page)),
    pendingPage: page => dispatch(pendingPage(page)),
    approvePage: page => dispatch(approvePage(page)),
    draftPage: page => dispatch(draftPage(page)),
    rejectPage: page => dispatch(rejectPage(page))
  };
};

class GroupPages extends Component {
  state = {};

  async handleDelete(page) {
    const confirm = window.confirm(
      "Are you sure you wish to delete this group? " +
        "\n" +
        "All your pages and endpoints present in this group will be deleted."
    );
    if (confirm) {
      this.props.deletePage(page);
      this.props.history.push({
        pathname: "/dashboard"
      });
    }
  }

  handleUpdate(page) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${this.props.versionId}/pages/${page.id}/edit`,
      editPage: page
    });
  }

  handleDisplay(page, collectionId) {
    if (isDashboardRoute(this.props)) {
      this.props.history.push({
        pathname: `/dashboard/pages/${page.id}`,
        page: page
      });
    } else {
      this.props.history.push({
        pathname: `/public/${collectionId}/pages/${page.id}`,
        page: page
      });
    }
  }

  handleDuplicate(page) {
    this.props.duplicatePage(page);
    this.props.history.push({
      pathname: "/dashboard"
    });
  }

  getCurrentUserRole(collectionId) {
    const teamId = this.props.collections[collectionId].teamId;
    if (teamId !== undefined) return this.props.teams[teamId].role;
  }

  checkAccess(collectionId) {
    const role = this.getCurrentUserRole(collectionId);
    if (role === "Admin" || role === "Owner") return true;
    else return false;
  }

  async handlePublicEndpointState(page) {
    if (page.state === "Draft") {
      if (this.checkAccess(this.props.collection_id)) {
        this.props.approvePage(page);
      } else {
        this.props.pendingPage(page);
      }
    }
  }

  async handleCancelRequest(page) {
    this.props.draftPage(page);
  }
  async handleApproveRequest(page) {
    this.props.approvePage(page);
  }
  async handleRejectRequest(page) {
    this.props.rejectPage(page);
  }

  render() {
    return (
      <div>
        {this.props.pages &&
          Object.keys(this.props.pages)
            .filter(
              pageId =>
                this.props.pages[pageId].versionId === this.props.version_id &&
                this.props.pages[pageId].groupId === this.props.group_id
            )

            .map((pageId, index) => (
              <div id="accordion" key={index}>
                <div className="card">
                  <div className="card-header" id="custom-card-header">
                    <i className="fa fa-file-text" aria-hidden="true"></i>
                    <h5 className="mb-0">
                      <button
                        className="btn"
                        data-toggle="collapse"
                        data-target={`#${pageId}`}
                        aria-expanded="true"
                        aria-controls={pageId}
                        onClick={() => {
                          const page = this.props.pages[pageId];
                          this.handleDisplay(page, this.props.collection_id);
                        }}
                      >
                        {this.props.pages[pageId].name}
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
                              this.handleDelete(this.props.pages[pageId])
                            }
                          >
                            Delete
                          </button>
                          <button
                            className="dropdown-item"
                            onClick={() =>
                              this.handleDuplicate(this.props.pages[pageId])
                            }
                          >
                            Duplicate
                          </button>
                          {this.checkAccess(this.props.collection_id) &&
                          (this.props.pages[pageId].state === "Pending" ||
                            this.props.pages[pageId].state ===
                              "Reject") ? null : (
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                this.handlePublicPageState(
                                  this.props.pages[pageId]
                                )
                              }
                            >
                              {this.props.pages[pageId].state === "Approved"
                                ? "Published"
                                : this.props.pages[pageId].state === "Draft"
                                ? "Make Public"
                                : this.props.pages[pageId].state}
                            </button>
                          )}

                          {!this.checkAccess(this.props.collection_id) &&
                          this.props.pages[pageId].state === "Pending" ? (
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                this.handleCancelRequest(
                                  this.props.pages[pageId]
                                )
                              }
                            >
                              Cancel Request
                            </button>
                          ) : null}

                          {this.checkAccess(this.props.collection_id) &&
                          (this.props.pages[pageId].state === "Approved" ||
                            this.props.pages[pageId].state === "Reject") ? (
                            <button
                              className="dropdown-item"
                              onClick={() =>
                                this.handleCancelRequest(
                                  this.props.pages[pageId]
                                )
                              }
                            >
                              Move to Draft
                            </button>
                          ) : null}
                          {this.checkAccess(this.props.collection_id) &&
                          this.props.pages[pageId].state === "Pending" ? (
                            <div>
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  this.handleApproveRequest(
                                    this.props.pages[pageId]
                                  )
                                }
                              >
                                Approve Request
                              </button>
                              <button
                                className="dropdown-item"
                                onClick={() =>
                                  this.handleRejectRequest(
                                    this.props.pages[pageId]
                                  )
                                }
                              >
                                Reject Request
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupPages);
