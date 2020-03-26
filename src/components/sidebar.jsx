import React, { Component } from "react";
import { Switch, Route } from "react-router-dom";
import Collections from "./collections/collections";
import ProtectedRoute from "./common/protectedRoute";
class SideBar extends Component {
  state = {};
  render() {
    return (
      <nav className="col-md-2 d-none d-md-block bg-light sidebar ">
        <div className="sidebar-sticky">
          <div id="search-box-wrapper">
            <div>
              {" "}
              <i class="fas fa-search" id="search-icon"></i>
            </div>
            <div id="search-box-input">
              <input type="text" id="search-box-input" placeholder="Filter" />
            </div>
          </div>

          <ul class="nav nav-tabs" id="myTab" role="tablist">
            <li class="nav-item">
              <a
                class="nav-link "
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
            <li class="nav-item">
              <a
                class="nav-link active"
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
            <li class="nav-item">
              <a
                class="nav-link"
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
          <div class="tab-content" id="myTabContent">
            <div
              class="tab-pane fade "
              id="history"
              role="tabpanel"
              aria-labelledby="history-tab"
            >
              History coming soon... stay tuned
            </div>
            <div
              class="tab-pane fade show active"
              id="collections"
              role="tabpanel"
              aria-labelledby="collections-tab"
            >
              <Switch>
                <ProtectedRoute
                  path="/dashboard/"
                  render={props => <Collections {...this.props} />}
                />

                <Route
                  path="/public/:collectionId"
                  render={props => <Collections {...this.props} />}
                />
              </Switch>
            </div>
            <div
              class="tab-pane fade"
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
