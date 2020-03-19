import React, { Component } from "react";
import { Switch } from "react-router-dom";
import ProtectedRoute from "./common/protectedRoute";
import Collections from "./collections/collections";
import { Tabs, Tab } from "react-bootstrap";
class SideBar extends Component {
  state = {};
  render() {
    return (
      <nav className="col-md-3 d-none d-md-block bg-light sidebar ">
        <div className="sidebar-sticky">
          <div id="search-box-wrapper">
            <i class="fas fa-search" id="search-icon"></i>

            <input id="search-box-input" type="text" placeholder="Filter" />
          </div>

          <Tabs defaultActiveKey="Collections" id="uncontrolled-tab-example">
            <Tab eventKey="History" title="History">
              History
            </Tab>
            <Tab eventKey="Collections" title="Collections">
              <Switch>
                <ProtectedRoute
                  path="/dashboard/"
                  render={props => <Collections {...this.props} />}
                />
              </Switch>
            </Tab>

            <Tab eventKey="Api" title="Api">
              Api
            </Tab>
          </Tabs>
        </div>
      </nav>
    );
  }
}

export default SideBar;
