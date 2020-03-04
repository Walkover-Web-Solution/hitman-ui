import React, { Component } from "react";
import pageService from "./pageService";

class EditPage extends Component {
  name = React.createRef();
  contents = React.createRef();

  state = {
    data: {
      id: null,
      versionId: null,
      groupId: null,
      name: "",
      contents: ""
    },
    errors: {}
  };

  async componentDidMount() {
    let data = {};
    const { page } = this.props.location;

    if (page) {
      const { id, versionId, groupId, name, contents } = page;

      data = {
        id,
        versionId,
        groupId,
        name,
        contents
      };
    } else {
      const { pathname } = this.props.location;
      const pageId = pathname.split("/")[4];
      let { data: page } = await pageService.getPage(pageId);
      const { id, versionId, groupId, name, contents } = page;
      data = {
        id,
        versionId,
        groupId,
        name,
        contents
      };
    }

    this.setState({ data });
  }

  handleChange = e => {
    const data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
  };

  handleSubmit = e => {
    e.preventDefault();
    const groupId = this.state.data.groupId;
    if (groupId === null) {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedPage: { ...this.state.data }
      });
    } else {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedPage: { ...this.state.data },
        groupId: { ...this.state.data.groupId }
      });
    }
  };

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <div className="form-group">
          <label htmlFor="exampleFormControlInput1">Page Name</label>
          <input
            ref={this.name}
            type="text"
            name="name"
            className="form-control"
            id="name"
            value={this.state.data.name}
            onChange={this.handleChange}
          />
        </div>
        <div className="form-group">
          <label htmlFor="exampleFormControlTextarea1">Contents</label>
          <textarea
            ref={this.contents}
            className="form-control"
            value={this.state.data.contents || ""}
            onChange={this.handleChange}
            name="contents"
            id="contents"
            rows="20"
          />
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    );
  }
}

export default EditPage;
