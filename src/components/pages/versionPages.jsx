import React, { Component } from "react";
import { connect } from "react-redux";
import Pages from "./pages";
import { deletePage, duplicatePage } from "./redux/pagesActions";

const mapStateToProps = state => {
  return {
    pages: state.pages
  };
};

const mapDispatchToProps = dispatch => {
  return {
    deletePage: page => dispatch(deletePage(page)),
    duplicatePage: page => dispatch(duplicatePage(page))
  };
};
class VersionPages extends Component {
  state = {};

  onDragStart = (e, pageId) => {
    this.draggedItem = pageId;
  };

  onDragOver = (e, pageId) => {
    e.preventDefault();
    this.draggedOverItem = pageId;
  };

  async onDragEnd(e) {
    if (this.draggedItem === this.draggedOverItem) {
      return;
    }
    let pageIds = this.props.page_ids.filter(item => item !== this.draggedItem);
    const index = this.props.page_ids.findIndex(
      vId => vId === this.draggedOverItem
    );
    pageIds.splice(index, 0, this.draggedItem);
    this.props.set_page_id(pageIds);
  }

  render() {
    return (
      <div>
        {this.props.pages &&
          Object.keys(this.props.pages)
            .filter(
              pageId =>
                this.props.pages[pageId].versionId === this.props.version_id &&
                this.props.pages[pageId].groupId === null
            )
            .map((pageId, index) => (
              <div key={index}>
                <Pages {...this.props} pageId={pageId} index={index}></Pages>
              </div>
            ))}
      </div>
    );
  }
}
export default connect(mapStateToProps, mapDispatchToProps)(VersionPages);
