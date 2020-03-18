import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import GroupPages from "../pages/groupPages";
import GroupForm from "../groups/groupForm";
import Endpoints from "../endpoints/endpoints";
import { deleteGroup, duplicateGroup } from "../groups/redux/groupsActions";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return { groups: state.groups };
};

const mapDispatchToProps = dispatch => {
  return {
    deleteGroup: group => dispatch(deleteGroup(group)),
    duplicateGroup: group => dispatch(duplicateGroup(group))
  };
};

class Groups extends Component {
  state = {
    showGroupForm: false
  };

  onDrop(destinationGroupId) {
    this.props.set_destination_group_id(destinationGroupId);
  }

  handleAddPage(groupId, versionId, collectionId) {
    this.props.history.push({
      pathname: `/dashboard/${collectionId}/versions/${versionId}/groups/${groupId}/pages/new`,
      versionId: versionId,
      groupId: groupId
    });
  }

  handleAddEndpoint(groupId, versions, groups) {
    this.props.history.push({
      pathname: `/dashboard/endpoints`,
      versions: versions,
      groups: groups,
      groupId: groupId,
      title: "Add New Endpoint",
      groupFlag: true
    });
  }

  handleDuplicate(group) {
    this.props.duplicateGroup(group);
    this.props.history.push({
      pathname: "/dashboard"
    });
  }

  handleDelete(group) {
    const confirm = window.confirm(
      "Are you sure you wish to delete this group? " +
        "\n" +
        "All your pages and endpoints present in this group will be deleted."
    );
    if (confirm) {
      this.props.deleteGroup(group);
      this.props.history.push({
        pathname: "/dashboard"
      });
    }
  }

  render() {
    return (
      <div>
        <div>
          {this.state.showGroupForm && (
            <GroupForm
              {...this.props}
              show={true}
              onHide={() => {
                this.setState({ showGroupForm: false });
              }}
              selected_group={this.state.selectedGroup}
              title="Edit Group"
            />
          )}
        </div>
        {Object.keys(this.props.groups)
          .filter(
            gId => this.props.groups[gId].versionId === this.props.version_id
          )
          .map(groupId => (
            <Accordion defaultActiveKey="0" key={groupId}>
              <Card>
                <Card.Header
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => this.onDrop(groupId)}
                >
                  <Accordion.Toggle as={Button} variant="link" eventKey="1">
                    {this.props.groups[groupId].name}
                  </Accordion.Toggle>
                  <DropdownButton
                    alignRight
                    title=""
                    id="dropdown-menu-align-right"
                    style={{ float: "right" }}
                  >
                    <Dropdown.Item
                      eventKey="1"
                      onClick={() => {
                        this.setState({
                          showGroupForm: true,
                          selectedGroup: this.props.groups[groupId]
                        });
                      }}
                    >
                      Edit
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="2"
                      onClick={() =>
                        this.handleDelete(this.props.groups[groupId])
                      }
                    >
                      Delete
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="1"
                      onClick={() =>
                        this.handleAddPage(
                          groupId,
                          this.props.groups[groupId].versionId,
                          this.props.collection_id
                        )
                      }
                    >
                      Add Page
                    </Dropdown.Item>
                    <Dropdown.Item
                      eventKey="3"
                      onClick={() =>
                        this.handleAddEndpoint(
                          groupId,
                          this.props.versions,
                          this.props.groups
                        )
                      }
                    >
                      Add Endpoint
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() =>
                        this.handleDuplicate(this.props.groups[groupId])
                      }
                    >
                      Duplicate
                    </Dropdown.Item>
                  </DropdownButton>
                </Card.Header>
                <Accordion.Collapse eventKey="1">
                  <Card.Body>
                    <GroupPages
                      {...this.props}
                      version_id={this.props.groups[groupId].versionId}
                      group_id={groupId}
                    />
                    <Endpoints
                      {...this.props}
                      group_id={groupId}
                      endpoints_order={
                        this.props.groups[groupId].endpointsOrder
                      }
                    />
                  </Card.Body>
                </Accordion.Collapse>
              </Card>
            </Accordion>
          ))}
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Groups);
