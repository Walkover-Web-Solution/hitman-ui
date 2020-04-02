import React, { Component } from "react";
import { Nav } from "react-bootstrap";
import tabService from "./tabService";

class CustomTabs extends Component {
  state = {};

  // addNewTab(props) {
  //   console.log(props);
  //   let tabs = [...props.tabs];
  //   const id = shortId.generate();
  //   props.set_tabs(
  //     [...tabs, { id, type: "endpoint", isSaved: false }],
  //     tabs.length
  //   );
  //   props.history.push({ pathname: "/dashboard/endpoint/new" });
  // }

  // closeTab(props, index) {
  //   let tabs = [...props.tabs];
  //   tabs.splice(index, 1);
  //   if (props.default_tab_index === index) {
  //     if (index !== 0) {
  //       const newIndex = props.default_tab_index - 1;
  //       props.set_tabs(tabs, newIndex);
  //       this.changeRoute(props, tabs[newIndex], "update endpoint");
  //     } else {
  //       if (tabs.length > 0) {
  //         const newIndex = index;
  //         props.set_tabs(tabs, newIndex);
  //         this.changeRoute(props, tabs, "update endpoint");
  //       } else {
  //         const newTabId = shortId.generate();
  //         tabs = [...tabs, { id: newTabId, type: "endpoint", isSaved: false }];

  //         props.set_tabs(tabs, tabs.length - 1);
  //         props.history.push({
  //           pathname: `/dashboard/endpoint/new`
  //         });
  //       }
  //     }
  //   } else {
  //     if (index < props.default_tab_index) {
  //       props.set_tabs(tabs, props.default_tab_index - 1);
  //     } else props.set_tabs(tabs);
  //   }
  // }

  // changeRoute(props, tab, title) {
  //   // if (tab.type === "endpoint") {
  //   if (tab.isSaved) {
  //     props.history.push({
  //       pathname: `/dashboard/${tab.type}/${tab.id}`,
  //       title
  //     });
  //   } else {
  //     props.history.push({
  //       pathname: `/dashboard/${tab.type}/new`
  //     });
  //   }
  //   // }
  // }

  // closeAllTabs(props) {
  //   const id = shortId.generate();
  //   const tabs = [{ id, type: "endpoint", isSaved: false }];
  //   props.set_tabs(tabs, 0);
  //   props.history.push({ pathname: "/dashboard/endpoint/new" });
  // }

  // selectTab(props, tab, index) {
  //   {
  //     props.set_tabs(null, index);
  //     if (tab.isSaved) {
  //       props.history.push({
  //         pathname: `/dashboard/${tab.type}/${tab.id}`
  //       });
  //     } else {
  //       props.history.push({
  //         pathname: `/dashboard/${tab.type}/new`
  //       });
  //     }
  //   }
  // }

  render() {
    return (
      <Nav variant="pills" className="flex-row">
        {Object.keys(this.props.endpoints).length > 0 &&
          this.props.tabs.map((tab, index) => (
            <Nav.Item>
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
                <i class="fas fa-times"></i>
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
