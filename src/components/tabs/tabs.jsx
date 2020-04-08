import React, { Component } from "react";
import { Nav } from "react-bootstrap";
import tabService from "./tabService";
import "./tabs.scss";

class CustomTabs extends Component {
  state = {};

  render() {
    return (
      <Nav variant="pills" className="flex-row">
        {Object.keys(this.props.endpoints).length > 0 &&
          this.props.tabs.map((tab, index) => (
            <Nav.Item key={tab.id}>
              <Nav.Link eventKey={tab.id}>
                <button
                  className="btn"
                  onClick={() =>
                    tabService.selectTab({ ...this.props }, tab, index)
                  }
                >
                  {tab.isSaved
                    ? this.props[tab.type + "s"] &&
                      this.props[tab.type + "s"][tab.id].name
                    : "Untitled"}
                </button>
              </Nav.Link>
              <button
                className="btn"
                onClick={() => tabService.closeTab({ ...this.props }, index)}
              >
                <i className="fas fa-times"></i>
              </button>
            </Nav.Item>
          ))}
        <Nav.Item className="tab-buttons" id="add-new-tab-button">
          <button
            className="btn"
            onClick={() => tabService.addNewTab({ ...this.props })}
          >
            <i className="fas fa-plus"></i>
          </button>
        </Nav.Item>
        <Nav.Item className="tab-buttons" id="tabs-menu-button">
          <div className="dropdown">
            <button
              className="btn "
              type="button"
              id="tabs-menu"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              <i className="fas fa-ellipsis-h"></i>
            </button>
            <div
              className="dropdown-menu dropdown-menu-right"
              aria-labelledby="tabs-menu"
            >
              <button
                className="btn"
                onClick={() =>
                  tabService.closeTab(
                    { ...this.props },
                    this.props.default_tab_index
                  )
                }
              >
                Close Current Tab
              </button>
              <button
                className="btn"
                onClick={() => tabService.closeAllTabs({ ...this.props })}
              >
                Close All Tabs
              </button>
            </div>
          </div>
        </Nav.Item>
      </Nav>
    );
  }
}

export default CustomTabs;
