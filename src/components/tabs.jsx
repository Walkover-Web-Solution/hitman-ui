import React, { Component } from "react";
import { Link, Route, Switch } from "react-router-dom";
import DisplayPage from "./pages/displayPage";
import DisplayEndpoint from "./endpoints/displayEndpoint";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";
import shortId from "shortid";

class CustomTabs extends Component {
  state = {};

  addNewTab() {
    let tabs = [...this.props.tabs];
    const id = shortId.generate();
    this.props.set_tabs(
      [...tabs, { id, type: "endpoint", isSaved: false }],
      tabs.length
    );
    this.props.history.push({ pathname: "/dashboard/endpoint/new" });
  }

  deleteTab(index) {
    let tabs = [...this.props.tabs];
    tabs.splice(index, 1);
    if (this.props.default_tab_index === index) {
      if (index !== 0) {
        const newIndex = this.props.default_tab_index - 1;
        this.props.set_tabs(tabs, newIndex);
        this.changeRoute(tabs[newIndex], "update endpoint");
      } else {
        if (tabs.length > 0) {
          const newIndex = index;
          this.props.set_tabs(tabs, newIndex);
          this.changeRoute(tabs, "update endpoint");
        } else {
          const newTabId = shortId.generate();
          tabs = [...tabs, { id: newTabId, type: "endpoint", isSaved: false }];

          this.props.set_tabs(tabs, tabs.length - 1);
          this.props.history.push({
            pathname: `/dashboard/endpoint/new`
          });
        }
      }
    } else {
      if (index < this.props.default_tab_index) {
        this.props.set_tabs(tabs, this.props.default_tab_index - 1);
      } else this.props.set_tabs(tabs);
    }
  }

  changeRoute(tab, title) {
    if (tab.type === "endpoint") {
      if (tab.isSaved) {
        this.props.history.push({
          pathname: `/dashboard/${tab.type}/${tab.id}`,
          title
        });
      } else {
        this.props.history.push({
          pathname: `/dashboard/${tab.type}/new`
        });
      }
    }
  }

  render() {
    return (
      <Nav variant="pills" className="flex-row">
        {Object.keys(this.props.endpoints).length &&
          this.props.tabs.map((tab, index) => (
            <Nav.Item>
              <Nav.Link eventKey={tab.id}>
                <button
                  className="btn"
                  onClick={() => {
                    this.props.set_tabs(null, index);
                    if (tab.isSaved) {
                      this.props.history.push({
                        pathname: `/dashboard/endpoint/${tab.id}`
                      });
                    } else {
                      this.props.history.push({
                        pathname: `/dashboard/endpoint/new`
                      });
                    }
                  }}
                >
                  {tab.type === "endpoint"
                    ? tab.isSaved
                      ? this.props.endpoints[tab.id].name
                      : "Untitled"
                    : null}
                </button>
              </Nav.Link>
              <button className="btn" onClick={() => this.deleteTab(index)}>
                x
              </button>
            </Nav.Item>
          ))}
        <Nav.Item>
          <button className="btn" onClick={() => this.addNewTab()}>
            +
          </button>
        </Nav.Item>
      </Nav>
    );
  }
}

export default CustomTabs;
