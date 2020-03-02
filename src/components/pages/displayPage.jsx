import React, { Component } from "react";
import pageService from "./pageService";
import jQuery from "jquery";

class DisplayPage extends Component {
  state = {
    data: {
      id: null,
      versionId: null,
      groupId: null,
      name: "",
      contents: ""
    }
  };

  async componentDidMount() {
    let data = {};
    if (!this.props.location.page) {
      const pageId = this.props.location.pathname.split("/")[4];
      let { data: page } = await pageService.getPage(pageId);
      const { id, versionId, groupId, name, contents } = page;
      data = {
        id,
        versionId,
        groupId,
        name,
        contents
      };
      this.setState({ data });
    }
  }

  handleEdit(page) {
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${page.id}/edit`,
      page: page
    });
  }
  render() {
    if (this.props.location.page) {
      const data = jQuery.extend(true, {}, this.props.location.page);
      this.setState({ data });
      this.props.history.push({ page: null });
    }

    return (
      <div>
        <button
          style={{ float: "right" }}
          className="btn btn-primary btn-sm"
          onClick={() => {
            this.handleEdit(this.state.data);
          }}
        >
          Edit page
        </button>
        <span>
          <p>{this.state.data.name}</p>
        </span>
        <span>
          <p>{this.state.data.contents}</p>
        </span>
      </div>
    );
  }
}

export default DisplayPage;
