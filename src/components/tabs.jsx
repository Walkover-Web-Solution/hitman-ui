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
        this.changeRoute(
          tabs[newIndex].type,
          tabs[newIndex].id,
          "update endpoint"
        );
      } else {
        if (tabs.length > 0) {
          const newIndex = index;
          this.props.set_tabs(tabs, newIndex);
          this.changeRoute(
            tabs[newIndex].type,
            tabs[newIndex].id,
            "update endpoint"
          );
        } else {
          console.log("Sdf");
          const newTabId = shortId.generate();
          tabs = [...tabs, { id: newTabId, type: "endpoint", isSaved: false }];

          this.props.set_tabs(tabs, tabs.length - 1);
          this.props.history.push({
            pathname: `/dashboard/endpoint/new`,

            title: "Add New Endpoint"
          });
        }
      }
    } else this.props.set_tabs(tabs);
  }

  changeRoute(type, id, title) {
    this.props.history.push({
      pathname: `/dashboard/${type}/${id}`
    });
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
