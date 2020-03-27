import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import Form from "../common/form";
import Joi from "joi-browser";

const mapStateToProps = state => {
  return {
    collections: state.collections,
    versions: state.versions,
    pages: state.pages
  };
};

class CreateEndpointForm extends Form {
  state = {
    data: {
      name: "",
      description: ""
    },
    list: {
      type: "collections",
      parentId: null
    },
    groupId: null,
    errors: {}
  };
  schema = {
    name: Joi.string()
      .required()
      .label("Username"),
    description: Joi.string()
      .allow(null, "")
      .label("description")
  };

  setList(item) {
    let list = {};
    switch (this.state.list.type) {
      case "collections":
        list.type = "versions";
        list.parentId = item.id;
        this.setState({ list });
        return;
      case "versions":
        list.type = "groups";
        list.parentId = item.id;
        this.setState({ list });
        return;
      case "groups":
        this.setState({ groupId: item.id });
    }
  }

  renderList() {
    var listItems = [];
    switch (this.state.list.type) {
      case "collections":
        listItems = Object.keys(this.props.collections).map(collectionId => ({
          name: this.props.collections[collectionId].name,
          id: this.props.collections[collectionId].id
        }));
        break;
      case "versions":
        listItems = Object.keys(this.props.versions)
          .filter(
            vId =>
              this.props.versions[vId].collectionId === this.state.list.parentId
          )
          .map(versionId => ({
            name: this.props.versions[versionId].number,
            id: this.props.versions[versionId].id
          }));
        break;
      case "groups":
        listItems = Object.keys(this.props.groups)
          .filter(
            gId => this.props.groups[gId].versionId === this.state.list.parentId
          )
          .map(groupId => ({
            name: this.props.groups[groupId].name,
            id: this.props.groups[groupId].id
          }));
        break;
    }

    return listItems;
  }

  renderListTitle() {
    switch (this.state.list.type) {
      case "collections":
        return "All Collections";
      case "versions":
        return this.props.collections[this.state.list.parentId].name;
      case "groups":
        return this.props.versions[this.state.list.parentId].number;
    }
  }

  async doSubmit() {
    this.props.onHide();
    this.props.set_group_id(this.state.groupId, this.state.data.name);
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <div>
          <Modal.Header
            className="custom-collection-modal-container"
            closeButton
          >
            <Modal.Title id="contained-modal-title-vcenter">
              {this.props.title}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              {this.renderInput("name", "Name", "Endpoint Name")}
              {this.renderTextArea("description", "Description", "Description")}
              <button
                className="btn btn-default custom-button"
                onClick={() => this.props.onHide()}
              >
                Cancel
              </button>
              <button className="btn">submit</button>
            </form>
            <ul>
              {this.renderListTitle()}
              {this.renderList().map(item => (
                <li>
                  <button className="btn" onClick={() => this.setList(item)}>
                    {item.name}
                  </button>
                </li>
              ))}
            </ul>
          </Modal.Body>
        </div>
      </Modal>
    );
  }
}

export default connect(mapStateToProps, null)(CreateEndpointForm);
