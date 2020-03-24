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

  deleteTab(id) {
    let tabs = { ...this.props.tabs };
    delete tabs[id];
    console.log(tabs);
    this.props.set_tabs(tabs);
  }

  changeRoute(type, id) {
    this.props.history.push({
      pathname: `/dashboard/${type}s/${id}`
    });
  }

  render() {
    return (
      <Nav variant="pills" className="flex-row">
        {Object.keys(this.props.tabs).map((tab, index) => (
          <Nav.Item>
            <Nav.Link eventKey={tab}>
              <button
                className="btn"
                onClick={() => {
                  this.setState({ key: tab });
                  this.props.history.push({
                    pathname: `/dashboard/endpoints/${tab}`
                  });
                }}
              >
                {tab}
              </button>
            </Nav.Link>
            <button className="btn" onClick={() => this.deleteTab(tab)}>
              x
            </button>
          </Nav.Item>
        ))}
      </Nav>
    );
  }
}

export default CustomTabs;
