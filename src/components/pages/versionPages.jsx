import React, { Component } from "react";
import { connect } from "react-redux";
import { deletePage, duplicatePage } from "./redux/pagesActions";
import pageService from "./pageService";

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
class Pages extends Component {
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

  openDeletePageModal(pageId) {
    this.setState({
      showDeleteModal: true,
      selectedPage: {
        ...this.props.pages[pageId]
      }
    });
  }

  closeDeletePageModal() {
    this.setState({ showDeleteModal: false });
  }

  render() {
    return (
      <div>
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
              pageId =>
                this.props.pages[pageId].versionId === this.props.version_id &&
                this.props.pages[pageId].groupId === null
            )
            .map((pageId, index) => (
              <div id="accordion" key={index}>
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
                          onClick={() => {
                            this.openDeletePageModal(pageId);
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
export default connect(mapStateToProps, mapDispatchToProps)(Pages);
