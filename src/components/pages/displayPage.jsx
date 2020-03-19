import React, { Component } from "react";
import jQuery from "jquery";
import store from "../../store/store";

class DisplayPage extends Component {
  state = {
    data: { id: null, versionId: null, groupId: null, name: "", contents: "" }
  };

  fetchPage(pageId) {
    let data = {};
    const { pages } = store.getState();
    let page = pages[pageId];
    if (page) {
      const { id, versionId, groupId, name, contents } = page;
      data = { id, versionId, groupId, name, contents };
      this.setState({ data });
    }
  }

  async componentDidMount() {
    if (!this.props.location.page) {
      const pageId = this.props.location.pathname.split("/")[3];
      this.fetchPage(pageId);
      store.subscribe(() => {
        this.fetchPage(pageId);
      });
    }
  }

  handleEdit(page) {
    this.props.history.push({
      pathname: `/dashboard/pages/${page.id}/edit`,
      page: page
    });
  }
  render() {
    if (this.props.location.page) {
      const data = { ...this.props.location.page };
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
