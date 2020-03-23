import Joi from "joi-browser";
import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import shortid from "shortid";
import Form from "../common/form";
import { addGroup, updateGroup } from "../groups/redux/groupsActions";

const mapDispatchToProps = dispatch => {
  return {
    addGroup: (versionId, group) => dispatch(addGroup(versionId, group)),
    updateGroup: group => dispatch(updateGroup(group))
  };
};

class GroupForm extends Form {
  state = {
    data: { name: "", host: "" },
    groupId: "",
    versionId: "",
    errors: {}
  };

  async componentDidMount() {
    if (this.props.title === "Add new Group") return;
    let data = {};
    if (this.props.selected_group) {
      const { name, host } = this.props.selected_group;
      data = { name, host };
    }
    this.setState({ data });
  }

  schema = {
    name: Joi.string()
      .required()
      .label("Group Name"),
    host: Joi.string()
      .uri()
      .allow(null, "")
      .label("Host")
  };

  async doSubmit() {
    this.props.onHide();
    if (this.props.title === "Add new Group") {
      const versionId = this.props.selectedVersion.id;
      const newGroup = {
        ...this.state.data,
        endpointsOrder: [],
        requestId: shortid.generate()
      };
      this.props.addGroup(versionId, newGroup);
    }

    if (this.props.title === "Edit Group") {
      const editedGroup = {
        ...this.state.data,
        id: this.props.selected_group.id,
        endpointsOrder: this.props.selected_group.endpointsOrder,
        versionId: this.props.selected_group.versionId
      };
      this.props.updateGroup(editedGroup);
    }
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="custom-collection-modal-container" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("name", "Group Name", "group name")}
            {this.renderInput("host", "Host", "host name")}
            {this.renderButton("Submit")}
            <button
              className="btn btn-default  custom-button"
              onClick={this.props.onHide}
            >
              Cancel
            </button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default connect(null, mapDispatchToProps)(GroupForm);
