import React, { Component } from "react";
import { isDashboardRoute } from "../common/utility";
import { connect } from "react-redux";
import {
  approvePage,
  draftPage,
  pendingPage,
  rejectPage,
} from "../publicEndpoint/redux/publicEndpointsActions";
import "./page.scss";
import tabStatusTypes from "../tabs/tabStatusTypes";
import tabService from "../tabs/tabService";
import { closeTab, openInNewTab } from "../tabs/redux/tabsActions";

const mapStateToProps = (state) => {
  return {
    tabs: state.tabs,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    pending_page: (page) => dispatch(pendingPage(page)),
    approve_page: (page) => dispatch(approvePage(page)),
    draft_page: (page) => dispatch(draftPage(page)),
    reject_page: (page) => dispatch(rejectPage(page)),
    close_tab: (tabId) => dispatch(closeTab(tabId)),
    open_in_new_tab: (tab) => dispatch(openInNewTab(tab)),
  };
};

class Pages extends Component {
  state = {};

  handleDisplay(page, collectionId, previewMode) {
    if (isDashboardRoute(this.props, true)) {
      if (!this.props.tabs.tabs[page.id]) {
        const previewTabId = Object.keys(this.props.tabs.tabs).filter(
          (tabId) => this.props.tabs.tabs[tabId].previewMode === true
        )[0];
        if (previewTabId) this.props.close_tab(previewTabId);
        this.props.open_in_new_tab({
          id: page.id,
          type: "page",
          status: tabStatusTypes.SAVED,
          previewMode,
          isModified: false,
        });
      } else if (
        this.props.tabs.tabs[page.id].previewMode === true &&
        previewMode === false
      ) {
        tabService.disablePreviewMode(page.id);
      }

      this.props.history.push({
        pathname: `/dashboard/page/${page.id}`,
        page: page,
      });
    } else {
      this.props.history.push({
        pathname: `/p/${collectionId}/pages/${page.id}/${this.props.collections[collectionId].name}`,
        page: page,
      });
    }
  }

  handleDuplicate(page) {
    this.props.duplicate_page(page);
  }

  async handlePublicPageState(page) {
    if (page.state === "Draft" || page.state === "Reject") {
      this.props.pending_page(page);
    }
  }

  async handleCancelRequest(page) {
    this.props.draft_page(page);
  }
  async handleApproveRequest(page) {
    this.props.approve_page(page);
  }
  async handleRejectRequest(page) {
    this.props.reject_page(page);
  }

  render() {
    const pageId = this.props.page_id;
    return (
      <React.Fragment>
        {isDashboardRoute(this.props, true) ? (
          <div
            className="sidebar-accordion"
            id="accordion"
            key={this.props.index}
          >
            {/* <div className="card"> */}
            {/* <div className="card-header" id="custom-card-header"> */}
            <button
              draggable
              onDragStart={(e) => this.props.onDragStart(e, pageId)}
              onDragOver={(e) => {
                e.preventDefault();
              }}
              onDrop={(e) => this.props.onDrop(e, pageId)}
              data-toggle="collapse"
              data-target={`#${pageId}`}
              aria-expanded="true"
              aria-controls={pageId}
              onClick={() => {
                const page = this.props.pages[pageId];
                this.handleDisplay(page, this.props.collection_id, true);
              }}
              onDoubleClick={() => {
                const page = this.props.pages[pageId];
                this.handleDisplay(page, this.props.collection_id, false);
              }}
            >
              <div className="sidebar-accordion-item">
                <i className="uil uil-file-alt" aria-hidden="true"></i>
                {this.props.pages[pageId].name}
              </div>
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
                    onClick={() => {
                      this.props.open_delete_page_modal(pageId);
                    }}
                  >
                    Delete
                  </a>
                  <a
                    className="dropdown-item"
                    onClick={() =>
                      this.handleDuplicate(this.props.pages[pageId])
                    }
                  >
                    Duplicate
                  </a>
                  {this.props.pages[pageId].state === "Draft" ||
                    this.props.pages[pageId].state === "Reject" ? (
                      <a
                        className="dropdown-item"
                        onClick={() =>
                          this.handlePublicPageState(this.props.pages[pageId])
                        }
                      >
                        Make Public
                      </a>
                    ) : null}

                  {this.props.pages[pageId].state === "Pending" ? (
                    <a
                      className="dropdown-item"
                      onClick={() =>
                        this.handleCancelRequest(this.props.pages[pageId])
                      }
                    >
                      Cancel Request
                    </a>
                  ) : null}
                </div>
              </div>
            </button>
            {/* </div> */}
            {/* </div> */}
          </div>
        ) : (
            <div
              className="hm-sidebar-item"
              onClick={() => {
                const page = this.props.pages[pageId];
                this.handleDisplay(page, this.props.collection_id, true);
              }}
              onDoubleClick={() => {
                const page = this.props.pages[pageId];
                this.handleDisplay(page, this.props.collection_id, false);
              }}
            >
              <i className="uil uil-file-alt" aria-hidden="true"></i>
              {this.props.pages[pageId].name}
            </div>
          )
        }
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Pages);
