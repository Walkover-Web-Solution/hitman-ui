import React, { Component } from "react";
import { connect } from "react-redux";
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
  };
};
class VersionPages extends Component {
  state = {};

  // onDragStart = (e, pageId) => {
  //   this.draggedItem = pageId;
  // };

  // onDragOver = (e, pageId) => {
  //   e.preventDefault();
  //   this.draggedOverItem = pageId;
  // };

  // async onDragEnd(e) {
  //   if (this.draggedItem === this.draggedOverItem) {
  //     return;
  //   }
  //   let pageIds = this.props.page_ids.filter(item => item !== this.draggedItem);
  //   const index = this.props.page_ids.findIndex(
  //     vId => vId === this.draggedOverItem
  //   );
  //   pageIds.splice(index, 0, this.draggedItem);
  //   this.props.set_page_id(pageIds);
  // }

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
      this.filteredVersionPages = {};
      this.filterFlag = true;
      let pages = { ...this.props.pages };
      let pageIds = Object.keys(pages);
      let pageNameIds = [];
      let pageNames = [];
      for (let i = 0; i < pageIds.length; i++) {
        if (pages[pageIds[i]].groupId === null) {
          const { name } = pages[pageIds[i]];
          pageNameIds.push({ name: name, id: pageIds[i] });
          pageNames.push(name);
        }
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
        this.filteredVersionPages[finalPageIds[i]] = this.props.pages[
          finalPageIds[i]
        ];
      }

      this.setState({ filter: this.props.filter });
      if (Object.keys(this.filteredVersionPages).length !== 0) {
        let versionIds = [];
        for (
          let i = 0;
          i < Object.keys(this.filteredVersionPages).length;
          i++
        ) {
          versionIds.push(this.filteredVersionPages[finalPageIds[i]].versionId);
        }
        this.props.show_filter_version(versionIds, "pages");
      } else {
        this.props.show_filter_version(null, "pages");
      }
    } else {
      if (this.filterFlag === false)
        this.filteredVersionPages = { ...this.props.pages };
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
