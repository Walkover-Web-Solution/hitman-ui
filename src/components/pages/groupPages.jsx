import React, { Component } from "react";
import { connect } from "react-redux";
import {
  approvePage,
  draftPage,
  pendingPage,
  rejectPage,
} from "../publicEndpoint/redux/publicEndpointsActions";
import Pages from "./pages";
import { deletePage, duplicatePage } from "./redux/pagesActions";
import pageService from "./pageService";
import { isDashboardRoute } from "../common/utility";
import filterService from "../../services/filterService";

const mapStateToProps = (state) => {
  return {
    pages: state.pages,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    delete_page: (page) => dispatch(deletePage(page)),
    duplicate_page: (page) => dispatch(duplicatePage(page)),
    pending_page: (page) => dispatch(pendingPage(page)),
    approve_page: (page) => dispatch(approvePage(page)),
    draft_page: (page) => dispatch(draftPage(page)),
    reject_page: (page) => dispatch(rejectPage(page)),
  };
};

class GroupPages extends Component {
  state = {};

  handleUpdate(page) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${this.props.versionId}/pages/${page.id}/edit`,
      editPage: page,
    });
  }

  openDeletePageModal(pageId) {
    this.setState({
      showDeleteModal: true,
      selectedPage: {
        ...this.props.pages[pageId],
      },
    });
  }

  closeDeletePageModal() {
    this.setState({ showDeleteModal: false });
  }

  filterGroupPages() {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== "" &&
      this.filterFlag === false
    ) {
      this.filterFlag = true;
      let groupIds = [];
      groupIds = filterService.filter(
        this.props.pages,
        this.props.filter,
        "groupPages"
      );
      this.setState({ filter: this.props.filter });
      if (groupIds.length !== 0) {
        this.props.show_filter_groups(groupIds, "pages");
      } else {
        this.props.show_filter_groups(null, "pages");
      }
    }
  }

  render() {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false;
    }
    return (
      <div>
        {this.filterGroupPages()}
        <div>
          {this.state.showDeleteModal &&
            pageService.showDeletePageModal(
              this.props,
              this.closeDeletePageModal.bind(this),
              "Delete Page",
              ` Are you sure you wish to delete this page? `,
              this.state.selectedPage
            )}
        </div>

        {this.props.pages &&
          Object.keys(this.props.pages)
            .filter(
              (pageId) =>
                this.props.pages[pageId].versionId === this.props.version_id &&
                this.props.pages[pageId].groupId === this.props.group_id
            )
            .map((pageId, index) => (
              <div
                key={index}
                className={
                  isDashboardRoute(this.props)
                    ? this.props.pages[pageId].state
                    : null
                }
              >
                <Pages
                  {...this.props}
                  page_id={pageId}
                  index={index}
                  open_delete_page_modal={this.openDeletePageModal.bind(this)}
                  close_delete_page_modal={this.closeDeletePageModal.bind(this)}
                />
              </div>
            ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupPages);
