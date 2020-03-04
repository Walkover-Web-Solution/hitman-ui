import React, { Component } from "react";
import pageService from "./pageService";
import jQuery from "jquery";
import "./page.css";
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
    const { page } = this.props.location;

    if (!page) {
      const { pathname } = this.props.location;
      //extracting pageId from pathname
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
    const { page } = this.props.location;

    if (page) {
      const data = jQuery.extend(true, {}, page);
      this.setState({ data });
      this.props.history.push({ page: null });
    }

    const { data } = this.state;

    return (
      <div>
        <button
          id="page-button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            this.handleEdit(data);
          }}
        >
          Edit page
        </button>
        <span>
          <p>{data.name}</p>
        </span>
        <span>
          <p>{data.contents}</p>
        </span>
      </div>
    );
  }
}

export default DisplayPage;
