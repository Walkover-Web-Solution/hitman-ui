import React, { Component } from "react";
import { connect } from "react-redux";
import Pages from "./pages";
import {
  deletePage,
  duplicatePage,
  setVersionPageIds,
} from "./redux/pagesActions";
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
    set_page_ids: (pageIds, groupId) =>
      dispatch(setVersionPageIds(pageIds, groupId)),
    delete_page: (page) => dispatch(deletePage(page)),
    duplicate_page: (page) => dispatch(duplicatePage(page)),
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

  onDragStart = (e, gId) => {
    this.draggedItem = gId;
  };

  onDrop(e, destinationPageId) {
    e.preventDefault();

    if (!this.draggedItem) {
    } else {
      if (this.draggedItem === destinationPageId) {
        this.draggedItem = null;
        return;
      }
      const pages = this.extractPages();
      const positionWisePages = this.makePositionWisePages({ ...pages });
      const index = positionWisePages.findIndex(
        (pId) => pId === destinationPageId
      );
      let pageIds = positionWisePages.filter(
        (item) => item !== this.draggedItem
      );
      pageIds.splice(index, 0, this.draggedItem);
      let pgs = {};
      for (let index = 0; index < pageIds.length; index++) {
        pgs[index] = this.props.pages[pageIds[index]];
      }
      console.log("pgs", pgs);
      this.props.set_page_ids(pageIds, this.props.group_id);
      this.draggedItem = null;
    }
  }

  extractPages() {
    let pages = {};
    for (let i = 0; i < Object.keys(this.props.pages).length; i++) {
      if (
        this.props.pages[Object.keys(this.props.pages)[i]].versionId ===
          this.props.version_id &&
        this.props.pages[Object.keys(this.props.pages)[i]].groupId === null
      ) {
        pages[Object.keys(this.props.pages)[i]] = this.props.pages[
          Object.keys(this.props.pages)[i]
        ];
      }
    }
    console.log("pages", pages);
    return pages;
  }

  makePositionWisePages(pages) {
    let positionWisePages = [];
    for (let i = 0; i < Object.keys(pages).length; i++) {
      positionWisePages[pages[Object.keys(pages)[i]].position] = Object.keys(
        pages
      )[i];
    }
    return positionWisePages;
  }

  filterVersionPages() {
    if (
      this.props.selectedCollection === true &&
      this.props.filter !== "" &&
      this.filterFlag === false
    ) {
      this.filterFlag = true;
      let versionIds = [];
      let versionIdsAndFilteredPages = [];
      versionIdsAndFilteredPages = filterService.filter(
        this.props.pages,
        this.props.filter,
        "versionPages"
      );
      this.filteredVersionPages = versionIdsAndFilteredPages[0];
      versionIds = versionIdsAndFilteredPages[1];
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
    if (!this.props.filter || this.props.filter === "") {
      this.filteredVersionPages = { ...this.props.pages };
    }

    let versionPageIds = Object.keys(this.props.pages).filter(
      (pId) =>
        this.props.pages[pId].groupId === null &&
        this.props.pages[pId].versionId === this.props.version_id
    );

    let versionPagesArray = [];
    for (let index = 0; index < versionPageIds.length; index++) {
      const id = versionPageIds[index];
      const groupPage = this.props.pages[id];
      versionPagesArray = [...versionPagesArray, groupPage];
    }

    versionPagesArray.sort(function (a, b) {
      return a.position - b.position;
    });

    let versionPages = {};
    for (let index = 0; index < versionPagesArray.length; index++) {
      const id = versionPagesArray[index].id;
      versionPages[id] = this.props.pages[id];
    }

    return (
      <React.Fragment>
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

        {versionPages &&
          Object.keys(versionPages)
            .filter(
              (pageId) =>
                this.props.pages[pageId].versionId === this.props.version_id &&
                this.props.pages[pageId].groupId === null
            )
            .map((pageId, index) => (
              <React.Fragment>
                {isDashboardRoute(this.props) ? (
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
                      onDragStart={this.onDragStart.bind(this)}
                      // onDragOver={(e) => {
                      //   e.preventDefault();
                      // }}
                      onDrop={this.onDrop.bind(this)}
                      open_delete_page_modal={this.openDeletePageModal.bind(
                        this
                      )}
                      close_delete_page_modal={this.closeDeletePageModal.bind(
                        this
                      )}
                    ></Pages>
                  </div>
                ) : (
                  <Pages
                    {...this.props}
                    page_id={pageId}
                    index={index}
                    open_delete_page_modal={this.openDeletePageModal.bind(this)}
                    close_delete_page_modal={this.closeDeletePageModal.bind(
                      this
                    )}
                  ></Pages>
                )}
              </React.Fragment>
            ))}
      </React.Fragment>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VersionPages);
