import React, { Component } from "react";
import store from "../../store/store";
import { isDashboardRoute } from "../common/utility";

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
      let pageId = "";
      if (isDashboardRoute(this.props))
        pageId = this.props.location.pathname.split("/")[3];
      else pageId = this.props.location.pathname.split("/")[4];
      this.fetchPage(pageId);
      store.subscribe(() => {
        this.fetchPage(pageId);
      });
    }
  }

  handleEdit(page) {
    this.props.history.push({
      pathname: `/dashboard/page/${page.id}/edit`,
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
      <div className="custom-display-page">
        {isDashboardRoute(this.props) ? (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => {
              this.handleEdit(this.state.data);
            }}
          >
            Edit page
          </button>
        ) : null}
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
