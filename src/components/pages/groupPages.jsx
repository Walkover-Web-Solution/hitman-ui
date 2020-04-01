import React, { Component } from "react";
import { connect } from "react-redux";
import {
  approvePage,
  draftPage,
  pendingPage,
  rejectPage
} from "../publicEndpoint/redux/publicEndpointsActions";
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
    duplicatePage: page => dispatch(duplicatePage(page)),
    pendingPage: page => dispatch(pendingPage(page)),
    approvePage: page => dispatch(approvePage(page)),
    draftPage: page => dispatch(draftPage(page)),
    rejectPage: page => dispatch(rejectPage(page))
  };
};

class GroupPages extends Component {
  state = {};

  handleUpdate(page) {
    this.props.history.push({
      pathname: `/dashboard/${this.props.collection_id}/versions/${this.props.versionId}/pages/${page.id}/edit`,
      editPage: page
    });
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
              <div key={index}>
                <Pages {...this.props} pageId={pageId} index={index}></Pages>
              </div>
            ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupPages);
