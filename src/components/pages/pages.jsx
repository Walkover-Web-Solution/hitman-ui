import React, { Component } from "react";
import { isDashboardRoute } from "../common/utility";
import { connect } from "react-redux";
import {
  approvePage,
  draftPage,
  pendingPage,
  rejectPage,
} from "../publicEndpoint/redux/publicEndpointsActions";

const mapDispatchToProps = (dispatch) => {
  return {
    pendingPage: (page) => dispatch(pendingPage(page)),
    approvePage: (page) => dispatch(approvePage(page)),
    draftPage: (page) => dispatch(draftPage(page)),
    rejectPage: (page) => dispatch(rejectPage(page)),
  };
};

class Pages extends Component {
  state = {};

  // handleDelete(page) {
  //   const confirm = window.confirm(
  //     "Are you sure you wish to delete this group? " +
  //       "\n" +
  //       "All your pages and endpoints present in this group will be deleted."
  //   );
  //   if (confirm) {
  //     this.props.deletePage(page);
  //     this.props.history.push({
  //       pathname: "/dashboard"
  //     });
  //   }
  // }

  handleDisplay(page, collectionId) {
    if (isDashboardRoute(this.props)) {
      this.props.history.push({
        pathname: `/dashboard/page/${page.id}`,
        page: page,
      });
    } else {
      this.props.history.push({
        pathname: `/public/${collectionId}/pages/${page.id}`,
        page: page,
      });
    }
  }

  handleDuplicate(page) {
    this.props.duplicatePage(page);
    this.props.history.push({
      pathname: "/dashboard",
    });
  }

  async handlePublicPageState(page) {
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

  getCurrentUserRole(collectionId) {
    const teamId = this.props.collections[collectionId].teamId;
    if (teamId !== undefined) return this.props.teams[teamId].role;
  }

  checkAccess(collectionId) {
    const role = this.getCurrentUserRole(collectionId);
    if (role === "Admin" || role === "Owner") return true;
    else return false;
  }

  render() {
    const pageId = this.props.page_id;
    return (
      <div id="accordion" key={this.props.index}>
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
                    onClick={() => {
                      this.props.open_delete_page_modal(pageId);
                    }}
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
                  {this.props.pages[pageId].state === "Draft" ? (
                    <button
                      className="dropdown-item"
                      onClick={() =>
                        this.handlePublicPageState(this.props.pages[pageId])
                      }
                    >
                      Make Public
                    </button>
                  ) : null}

                  {!this.checkAccess(this.props.collection_id) &&
                  this.props.pages[pageId].state === "Pending" ? (
                    <button
                      className="dropdown-item"
                      onClick={() =>
                        this.handleCancelRequest(this.props.pages[pageId])
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
                        this.handleCancelRequest(this.props.pages[pageId])
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
                          this.handleApproveRequest(this.props.pages[pageId])
                        }
                      >
                        Approve Request
                      </button>
                      <button
                        className="dropdown-item"
                        onClick={() =>
                          this.handleRejectRequest(this.props.pages[pageId])
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
    );
  }
}

export default connect(null, mapDispatchToProps)(Pages);
