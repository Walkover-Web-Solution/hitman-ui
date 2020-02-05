import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import pageService from "../services/pageService";

class DisplayPage extends Component {
  state = {
    name: "",
    contents: ""
  };
  async handleUpdatePage(editedPage, pageId, versionId) {
    const { data: editPage } = await pageService.updatePage(pageId, editedPage);
  }
  handleEdit(page) {
    this.props.history.push({
      pathname: `/collections/pages/${page.id}/edit`,
      page: page
    });
  }
  render() {
    if (this.props.location.data && this.props.location.data.groupId === "") {
      const data = { ...this.props.location.data };
      delete data.pageId;
      delete data.versionId;
      delete data.groupId;
      this.handleUpdatePage(
        data,
        this.props.location.data.pageId,
        this.props.location.data.versionId
      );
    } else if (
      this.props.location.data &&
      this.props.location.data.versionId === ""
    ) {
      this.handleAddGroupPage(
        this.props.location.data.versionId,
        this.props.location.data.groupId,
        this.props.location.data
      );
    }
    if (this.props.location.data) {
      this.state.name = this.props.location.data.name;
      this.state.contents = this.props.location.data.contents;
    }
    if (this.props.location.page) {
      this.state.name = this.props.location.page.name;
      this.state.contents = this.props.location.page.contents;
    }
    console.log("oo", this.props);
    const { page } = this.props.location;
    console.log("props", page);

    // if (!this.props.location.data) {
    //   return <Redirect to={`/collections/pages/${page.pageId}`} />;
    // }
    return (
      <div>
        <button
          style={{ float: "right" }}
          className="btn btn-primary btn-sm"
          onClick={() => {
            this.handleEdit(page);
          }}
        >
          Edit page
        </button>
        <span>
          <p>{this.state.name}</p>
        </span>
        <span>
          <p>{this.state.contents}</p>
        </span>
      </div>
    );
  }
}

export default DisplayPage;
