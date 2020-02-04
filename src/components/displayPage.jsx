import React, { Component } from "react";
import { Redirect } from "react-router-dom";

class DisplayPage extends Component {
  state = {};

  handleEdit(page) {
    this.props.history.push({
      pathname: `/dashboard/collections/pages/${page.id}/edit`,
      page: page
    });
  }

  render() {
    const { page } = this.props.location;

    if (!page) {
      return <Redirect to="/dashboard/collections" />;
    }
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
          <p>{page.name}</p>
        </span>
        <span>
          <p>{page.contents}</p>
        </span>
      </div>
    );
  }
}

export default DisplayPage;
