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

  emptyFilter() {
    let data = { ...this.state.data };
    data.filter = "";
    this.setState({ data });
  }

  render() {
    return (
      <nav
        className={
          isDashboardRoute(this.props)
            ? "col-md-2 d-none d-md-block bg-light sidebar "
            : "public-endpoint-sidebar"
        }
      >
        {isDashboardRoute(this.props) ? (
          <div className="sidebar-sticky">
            <div>
              <div id="search-box-wrapper">
                <div>
                  {" "}
                  <i className="fas fa-search" id="search-icon"></i>
                </div>
                <div id="search-box-input">
                  <input
                    value={this.state.data.filter}
                    type="text"
                    id="search-box-input"
                    name="filter"
                    placeholder="Filter"
                    onChange={this.handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <Switch>
          <ProtectedRoute
            path="/dashboard/"
            render={(props) => (
              <Collections
                {...this.props}
                empty_filter={this.emptyFilter.bind(this)}
                filter={this.state.data.filter}
              />
            )}
          />

          <Route
            path="/public/:collectionId"
            render={(props) => <Collections {...this.props} />}
          />
        </Switch>
      </nav>
    );
  }
}

export default SideBar;
