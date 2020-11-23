import React, { Component } from "react";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import store from "../../store/store";
import { updatePage } from "../pages/redux/pagesActions";
import "./page.scss";
import { toast } from "react-toastify";
var Link = Quill.import("formats/link");
var builtInFunc = Link.sanitize;
Link.sanitize = function customSanitizeLinkInput(linkValueInput) {
  var val = linkValueInput;
  if (/^\w+:/.test(val));
  else if (!/^https?:/.test(val)) val = "https://" + val;
  return builtInFunc.call(this, val);
};

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    update_page: (editedPage, pageId) =>
      dispatch(updatePage(ownProps.history, editedPage, pageId)),
  };
};

class EditPage extends Component {


  constructor(props) {
    super(props);
    this.state = {
      data: { id: null, versionId: null, groupId: null, name: "", contents: "" },
    };
    this.name = React.createRef();
    this.contents = React.createRef();

    this.modules = {
      toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ color: [] }, { background: [] }],

        [({ list: "ordered" }, { list: "bullet" })],
        ["link"],
      ],
    };

    this.formats = [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "color",
      "background",
      "list",
      "bullet",
      "link",
    ];
  }

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

  handleNameChange = (e) => {
    const data = { ...this.state.data };
    data["name"] = e.currentTarget.value;
    this.setState({ data });
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const groupId = this.state.data.groupId;

    if (groupId === null) {
      const editedPage = { ...this.state.data };
      if (editedPage.name.trim() === "") {
        toast.error("Page name cannot be empty.");
      } else {
        this.props.update_page(editedPage, editedPage.id);
        this.props.history.push({
          pathname: `/dashboard/page/${editedPage.id}`,
        });
      }
    } else {
      const editedPage = { ...this.state.data };
      if (editedPage.name.trim() === "") {
        toast.error("Page name cannot be empty.");
      } else {
        this.props.update_page(editedPage, editedPage.id);
        this.props.history.push({
          pathname: `/dashboard/page/${editedPage.id}`,
        });
      }
    }
  };

  render() {
    return (
      <div className="custom-edit-page">
        <div>
          <input
            name={"name"}
            id="name"
            value={this.state.data.name}
            onChange={this.handleNameChange}
            type={"text"}
            className="form-control custom-page-name-input"
            placeholder="Page Name"
          />
        </div>

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
