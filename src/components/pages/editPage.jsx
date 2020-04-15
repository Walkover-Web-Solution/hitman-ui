import React, { Component } from "react";
import { updatePage } from "../pages/redux/pagesActions";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import store from "../../store/store";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./page.scss";

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    updatePage: (editedPage, pageId) =>
      dispatch(updatePage(ownProps.history, editedPage, pageId)),
  };
};

class EditPage extends Component {
  name = React.createRef();
  contents = React.createRef();
  state = {
    data: { id: null, versionId: null, groupId: null, name: "", contents: "" },
  };

  modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ color: [] }, { background: [] }],
      [{ font: [] }],
      [{ align: [] }],
      [
        ({ list: "ordered" },
        { list: "bullet" },
        { indent: "-1" },
        { indent: "+1" }),
      ],
      ["link"],
      ["clean"],
    ],
  };
  formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "color",
    "background",
    "font",
    "align",
    "list",
    "bullet",
    "indent",
    "link",
  ];

  fetchPage(pageId) {
    let data = {};
    const { pages } = store.getState();
    let page = pages[pageId];
    if (page) {
      const { id, versionId, groupId, name, contents } = page;
      data = {
        id,
        versionId,
        groupId,
        name,
        contents,
      };

      this.setState({ data });
    }
  }

  async componentDidMount() {
    let data = {};
    if (this.props.location.page) {
      const {
        id,
        versionId,
        groupId,
        name,
        contents,
      } = this.props.location.page;

      data = { id, versionId, groupId, name, contents };

      this.setState({ data });
    } else {
      const pageId = this.props.location.pathname.split("/")[3];
      this.fetchPage(pageId);
      store.subscribe(() => {
        this.fetchPage(pageId);
      });
    }
  }

  handleChange = (value) => {
    const data = { ...this.state.data };
    data["contents"] = value;
    this.setState({ data });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const groupId = this.state.data.groupId;

    if (groupId === null) {
      const editedPage = { ...this.state.data };
      this.props.updatePage(editedPage, editedPage.id);
      this.props.history.push({
        pathname: `/dashboard/page/${editedPage.id}`,
      });
    } else {
      const editedPage = { ...this.state.data };
      this.props.updatePage(editedPage, editedPage.id);
      this.props.history.push({
        pathname: `/dashboard/page/${editedPage.id}`,
      });
    }
  };

  render() {
    return (
      <div className="custom-edit-page">
        <div style={{ marginBottom: "50px" }}>
          <ReactQuill
            style={{ height: "400px" }}
            value={this.state.data.contents}
            modules={this.modules}
            formats={this.formats}
            onChange={this.handleChange}
          />
        </div>

        <div>
          <form onSubmit={this.handleSubmit}>
            <button
              onSubmit={this.handleSubmit}
              type="submit"
              className="btn btn-primary"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }
}

export default withRouter(connect(null, mapDispatchToProps)(EditPage));
