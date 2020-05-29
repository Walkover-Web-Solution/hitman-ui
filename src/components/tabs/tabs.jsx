import React, { Component } from "react";
import { Nav } from "react-bootstrap";
import SavePromptModal from "./savePromptModal";
import "./tabs.scss";
import tabService from "./tabService";

class CustomTabs extends Component {
  state = { showSavePrompt: false };

  renderTabName(tabId) {
    const tab = this.props.tabs.tabs[tabId];
    if (!tab) return;
    switch (tab.type) {
      case "endpoint":
        if (this.props.endpoints[tabId]) {
          if (tab.previewMode)
            return (
              <label style={{ fontStyle: "italic" }}>
                {this.props.endpoints[tabId].name}
              </label>
            );
          else return <label>{this.props.endpoints[tabId].name}</label>;
        } else {
          return "Untitled";
        }

      case "page":
        if (this.props.pages[tabId]) {
          if (tab.previewMode)
            return (
              <label style={{ fontStyle: "italic" }}>
                {this.props.pages[tabId].name}
              </label>
            );
          else return <label>{this.props.pages[tabId].name}</label>;
        }
        break;
      default:
    }
  }

  removeTab(tabId) {
    if (this.props.tabs.tabs[tabId].isModified) {
      this.setState({ showSavePrompt: true, selectedTabId: tabId });
    } else {
      tabService.removeTab(tabId, { ...this.props });
    }
  }

  closeSavePrompt() {
    this.setState({ showSavePrompt: false });
  }

  onDragStart = (tId) => {
    this.draggedItem = tId;
  };

  onDragOver = (e) => {
    e.preventDefault();
  };

  onDrop = (e, droppedOnItem) => {
    e.preventDefault();
    if (this.draggedItem === droppedOnItem) {
      this.draggedItem = null;
      return;
    }
    let tabsOrder = this.props.tabs.tabsOrder.filter(
      (item) => item !== this.draggedItem
    );
    const index = this.props.tabs.tabsOrder.findIndex(
      (tId) => tId === droppedOnItem
    );
    tabsOrder.splice(index, 0, this.draggedItem);
    this.props.set_tabs_order(tabsOrder);
  };

  render() {
    return (
      <Nav variant="pills" className="flex-row flex-nowrap item-wrp">
        <div>
          {this.state.showSavePrompt && (
            <SavePromptModal
              {...this.props}
              show={true}
              onHide={() => this.closeSavePrompt()}
              tab_id={this.state.selectedTabId}
            />
          )}
        </div>
        {this.props.tabs.tabsOrder.map((tabId, index) => (
          <Nav.Item
            key={tabId}
            draggable
            onDragOver={this.onDragOver}
            onDragStart={() => this.onDragStart(tabId)}
            onDrop={(e) => this.onDrop(e, tabId)}
          >
            <Nav.Link eventKey={tabId}>
              <button
                className="btn"
                onClick={() => tabService.selectTab({ ...this.props }, tabId)}
                onDoubleClick={() => {
                  tabService.disablePreviewMode(tabId);
                }}
              >
                {this.renderTabName(tabId)}
              </button>
            </Nav.Link>
            <button className="btn" onClick={() => this.removeTab(tabId)}>
              {this.props.tabs.tabs[tabId].isModified ? (
                <i className="fas fa-circle" id="modified-dot-icon"></i>
              ) : (
                <i className="fas fa-times"></i>
              )}
            </button>
          </Nav.Item>
        ))}
        <Nav.Item className="tab-buttons" id="add-new-tab-button">
          <button
            className="btn"
            onClick={() => tabService.newTab({ ...this.props })}
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
                  tabService.removeTab(this.props.tabs.activeTabId, {
                    ...this.props,
                  })
                }
              >
                Close Current Tab
              </button>
              <button
                className="btn"
                onClick={() => tabService.removeAllTabs({ ...this.props })}
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
