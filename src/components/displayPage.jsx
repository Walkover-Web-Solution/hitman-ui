import React, { Component } from "react";
import { Redirect } from "react-router-dom";

class DisplayPage extends Component {
  state = {};

  handleEdit(page) {
    console.log("displayprops", page);
    this.props.history.push({
      pathname: `/collections/pages/${page.id}/edit`,
      page: page
    });
  }

  render() {
    const { page } = this.props.location;
    // console.log('props', page)

    if (!page) {
      return <Redirect to="/collections" />;
    }
    return (
      <div>
        <span>
          <p>{page.name}</p>
        </span>
        <span>
          <p>{page.contents}</p>
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            this.handleEdit(page);
          }}
        >
          Edit page
        </button>
      </div>
    );
  }
}

export default DisplayPage;
