import React, { Component } from "react";
import { connect } from "react-redux";
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

  handleDisplay(page) {
    this.props.history.push({
      pathname: `/dashboard/pages/${page.id}`,
      page: page
    });
  }

  handleDuplicate(page) {
    this.props.duplicatePage(page);
    this.props.history.push({
      pathname: "/dashboard"
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
              <div id="accordion" key={index}>
                <div className="card">
                  <div className="card-header" id="custom-card-header">
                    {/* <i
                      className="fas fa-folder-open"
                      style={{ margin: "5px" }}
                    ></i> */}
                    <h5 className="mb-0">
                      <button
                        className="btn"
                        data-toggle="collapse"
                        data-target={`#${pageId}`}
                        aria-expanded="true"
                        aria-controls={pageId}
                        onClick={() => {
                          const page = this.props.pages[pageId];
                          this.handleDisplay(page);
                        }}
                      >
                        {this.props.pages[pageId].name}
                      </button>
                    </h5>
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
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupPages);
