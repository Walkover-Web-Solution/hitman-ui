import React from "react";
import { Link } from "react-router-dom";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import Form from "../common/form";
import groupsService from "./groupsService";
import { addGroup, updateGroup } from "../groups/groupsActions";
import { connect } from "react-redux";
import shortid from "shortid";

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
    const groupId = this.props.location.pathname.split("/")[7];
    const versionId = this.props.location.pathname.split("/")[5];
    let endpointsOrder = [];
    if (this.props.location.editGroup) {
      endpointsOrder = this.props.location.editGroup.endpointsOrder;
      const { name, host } = this.props.location.editGroup;
      data = { name, host };
    } else {
      const {
        data: { name, host }
      } = await groupsService.getGroup(groupId);
      data = { name, host };
    }
    this.setState({ data, groupId, versionId, endpointsOrder });
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
    if (this.props.title === "Add new Group") {
       this.props.onHide();
      const versionId=this.props.selectedVersion.id
      const newGroup ={...this.state.data,endpointsOrder:[],requestId:shortid.generate()}
      this.props.addGroup(versionId,newGroup);
    }

    if (this.props.title === "Edit Group") {
      const  editedGroup= {...this.state.data,id: this.state.groupId,endpointsOrder: this.state.endpointsOrder
        }
        this.props.updateGroup(editedGroup);
      this.props.history.push({
        pathname: `/dashboard/collections` 
      });
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
        <Modal.Header>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("name", "Group Name*")}
            {this.renderInput("host", "Host")}
            {this.renderButton("Submit")}
            <button onClick = {this.props.onHide}>Cancel</button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default connect(null, mapDispatchToProps)(GroupForm);
