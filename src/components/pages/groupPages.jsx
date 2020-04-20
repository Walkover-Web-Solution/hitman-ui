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

const mapStateToProps = (state) => {
  return {
    pages: state.pages,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    deletePage: (page) => dispatch(deletePage(page)),
    duplicatePage: (page) => dispatch(duplicatePage(page)),
    pendingPage: (page) => dispatch(pendingPage(page)),
    approvePage: (page) => dispatch(approvePage(page)),
    draftPage: (page) => dispatch(draftPage(page)),
    rejectPage: (page) => dispatch(rejectPage(page)),
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
      this.filteredGroupPages = {};
      this.filterFlag = true;
      let pages = { ...this.props.pages };
      let pageIds = Object.keys(pages);
      let pageNameIds = [];
      let pageNames = [];
      for (let i = 0; i < pageIds.length; i++) {
        const { name } = pages[pageIds[i]];
        pageNameIds.push({ name: name, id: pageIds[i] });
        pageNames.push(name);
      }
      let finalPageNames = pageNames.filter((name) => {
        return (
          name.toLowerCase().indexOf(this.props.filter.toLowerCase()) !== -1
        );
      });
      let finalPageIds = [];
      let uniqueIds = {};
      for (let i = 0; i < finalPageNames.length; i++) {
        for (let j = 0; j < Object.keys(pageNameIds).length; j++) {
          if (
            finalPageNames[i] === pageNameIds[j].name &&
            !uniqueIds[pageNameIds[j].id]
          ) {
            finalPageIds.push(pageNameIds[j].id);
            uniqueIds[pageNameIds[j].id] = true;
            break;
          }
        }
      }
      for (let i = 0; i < finalPageIds.length; i++) {
        this.filteredGroupPages[finalPageIds[i]] = this.props.pages[
          finalPageIds[i]
        ];
      }
      this.setState({ filter: this.props.filter });
      if (Object.keys(this.filteredGroupPages).length !== 0) {
        let groupIds = [];
        for (let i = 0; i < Object.keys(this.filteredGroupPages).length; i++) {
          groupIds.push(this.filteredGroupPages[finalPageIds[i]].groupId);
        }
        this.props.show_filter_groups(groupIds, "pages");
      } else {
        this.props.show_filter_groups(null, "pages");
      }
    } else {
      if (this.filterFlag === false)
        this.filteredGroupPages = { ...this.props.pages };
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
