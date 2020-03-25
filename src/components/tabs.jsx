import React, { Component } from "react";
import { Link, Route, Switch } from "react-router-dom";
import DisplayPage from "./pages/displayPage";
import DisplayEndpoint from "./endpoints/displayEndpoint";
import { Tabs, Tab, Row, Col, Nav } from "react-bootstrap";
import shortId from "shortid";

class CustomTabs extends Component {
  state = {};

  addNewTab() {
    let tabs = { ...this.props.tabs };
    const id = shortId.generate();
    this.props.set_tabs({
      ...tabs,
      [id]: { id, type: "endpoint" }
    });
  }

  deleteTab(index) {
    let tabs = [...this.props.tabs];
    tabs.splice(index, 1);
    if (this.props.default_tab_index === index)
      this.props.set_tabs(tabs, this.props.default_tab_index - 1);
    else this.props.set_tabs(tabs);
  }

  changeRoute(type, id) {
    this.props.history.push({
      pathname: `/dashboard/${type}s/${id}`
    });
  }

  render() {
    console.log(this.props);
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
                    this.props.history.push({
                      pathname: `/dashboard/endpoints/${tab.id}`
                    });
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
      </Nav>
    );
  }
}

export default CustomTabs;
