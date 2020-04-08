import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Collections from "../collections/collections";
import ProtectedRoute from "../common/protectedRoute";
import { isDashboardRoute } from "../common/utility";
import "./main.scss";
class SideBar extends Component {
  state = {
    data: {
      filter: "",
    },
  };

  handleChange = (e) => {
    let data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
  };

  render() {
    return (
      <nav className="col-md-2 d-none d-md-block bg-light sidebar ">
        <div className="sidebar-sticky">
          {isDashboardRoute(this.props) ? (
            <div id="search-box-wrapper">
              <div>
                {" "}
                <i className="fas fa-search" id="search-icon"></i>
              </div>
              <div id="search-box-input">
                <input
                  type="text"
                  id="search-box-input"
                  name="filter"
                  placeholder="Filter"
                  onChange={this.handleChange}
                />
              </div>
            </div>
          ) : null}

          <ul className="nav nav-tabs" id="myTab" role="tablist">
            <li className="nav-item">
              <a
                className="nav-link "
                id="history-tab"
                data-toggle="tab"
                href="#history"
                role="tab"
                aria-controls="history"
                aria-selected="false"
              >
                History
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link active"
                id="collections-tab"
                data-toggle="tab"
                href="#collections"
                role="tab"
                aria-controls="collections"
                aria-selected="true"
              >
                Collections
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link"
                id="api-tab"
                data-toggle="tab"
                href="#api"
                role="tab"
                aria-controls="api"
                aria-selected="false"
              >
                APIs
              </a>
            </li>
          </ul>
          <div className="tab-content" id="myTabContent">
            <div
              className="tab-pane fade "
              id="history"
              role="tabpanel"
              aria-labelledby="history-tab"
            >
              History coming soon... stay tuned
            </div>
            <div
              className="tab-pane fade show active"
              id="collections"
              role="tabpanel"
              aria-labelledby="collections-tab"
            >
              <Switch>
                <ProtectedRoute
                  path="/dashboard/"
                  render={(props) => (
                    <Collections
                      {...this.props}
                      filter={this.state.data.filter}
                    />
                  )}
                />

                <Route
                  path="/public/:collectionId"
                  render={(props) => <Collections {...this.props} />}
                />
              </Switch>
            </div>
            <div
              className="tab-pane fade"
              id="api"
              role="tabpanel"
              aria-labelledby="api-tab"
            >
              ...
            </div>
          </div>
        </div>
      </nav>
    );
  }
}

export default SideBar;
