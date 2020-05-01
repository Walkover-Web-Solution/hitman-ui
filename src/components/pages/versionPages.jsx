import React, { Component } from "react";
import { connect } from "react-redux";
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
    deletePage: (page) => dispatch(deletePage(page)),
    duplicatePage: (page) => dispatch(duplicatePage(page)),
  };
};
class VersionPages extends Component {
  state = {};

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

  filterVersionPages() {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== "" &&
      this.filterFlag === false
    ) {
      this.filterFlag = true;
      let versionIds = [];
      versionIds = filterService.filter(
        this.props.pages,
        this.props.filter,
        "versionPages"
      );
      this.setState({ filter: this.props.filter });
      if (versionIds.length !== 0) {
        this.props.show_filter_version(versionIds, "versionPages");
      } else {
        this.props.show_filter_version(null, "versionPages");
      }
    }
  }

  render() {
    if (this.state.filter !== this.props.filter) {
      this.filterFlag = false;
    }
    return (
      <div>
        {this.filterVersionPages()}
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
                this.props.pages[pageId].groupId === null
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
                ></Pages>
              </div>
            ))}
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VersionPages);
