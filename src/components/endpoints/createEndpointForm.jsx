import Joi from "joi-browser";
import React from "react";
import { Modal } from "react-bootstrap";
import { connect } from "react-redux";
import Form from "../common/form";

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

  componentDidMount() {
    const data = { ...this.state.data };
    data.name = this.props.name;
    this.setState({ data });
  }

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
        list.type = "endpoints";
        list.parentId = item.id;
        this.setState({ list });
      // this.setState({ groupId: item.id });
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
      case "endpoints":
        listItems = Object.keys(this.props.endpoints)
          .filter(
            eId =>
              this.props.endpoints[eId].groupId === this.state.list.parentId
          )
          .map(endpointId => ({
            name: this.props.endpoints[endpointId].name,
            id: this.props.endpoints[endpointId].id
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
      case "endpoints":
        return this.props.groups[this.state.list.parentId].name;
    }
  }

  goBack() {
    let list = { ...this.state.list };
    switch (this.state.list.type) {
      case "versions":
        list.type = "collections";
        list.parentId = null;
        this.setState({ list });
        break;
      case "groups":
        list.type = "versions";
        list.parentId = this.props.versions[
          this.state.list.parentId
        ].collectionId;
        this.setState({ list });
        break;
      case "endpoints":
        list.type = "groups";
        list.parentId = this.props.groups[this.state.list.parentId].versionId;
        this.setState({ list });
        break;
    }
  }

  async doSubmit() {
    this.props.onHide();
    this.props.set_group_id(this.state.list.parentId, this.state.data.name);
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        animation={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        id="endpoint-modal"
      >
        <div>
          <Modal.Header
            className="custom-collection-modal-container"
            closeButton
          >
            <Modal.Title id="contained-modal-title-vcenter">
              Add Endpoint
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={this.handleSubmit}>
              {this.renderInput("name", "Name", "Endpoint Name")}
              {this.renderTextArea("description", "Description", "Description")}
            </form>
            <div class="card" id="endpoint-form-collection-list">
              <div class="card-title">
                {this.state.list.type === "collections" ? (
                  "All Collections"
                ) : (
                  <button className="btn" onClick={() => this.goBack()}>
                    <i class="fas fa-chevron-left"></i>
                    {this.renderListTitle()}
                  </button>
                )}
              </div>
              <ul class="list-group" id="folder-list">
                {this.state.list.type === "endpoints" ? (
                  this.renderList().map(item => (
                    <li id="endpoint-list">
                      <div
                        className={this.props.endpoints[item.id].requestType}
                      >
                        {this.props.endpoints[item.id].requestType}
                      </div>
                      <div className="list-item-wrapper">{item.name}</div>
                    </li>
                  ))
                ) : this.renderList().length ? (
                  this.renderList().map(item => (
                    <li class="list-group-item">
                      <button
                        className="btn"
                        onClick={() => this.setList(item)}
                      >
                        <div className="list-item-wrapper">
                          <i class="fas fa-folder"></i>
                          {item.name}
                        </div>
                        <i class="fas fa-chevron-right"></i>
                      </button>
                    </li>
                  ))
                ) : (
                  <div className="not-found-label">
                    {this.state.list.type + " not found in this folder"}
                  </div>
                )}
              </ul>
            </div>
            <button
              className="btn btn-default custom-button"
              onClick={() => this.props.onHide()}
            >
              Cancel
            </button>
            <button
              className="btn"
              onClick={this.handleSubmit}
              disabled={this.state.list.type !== "endpoints"}
            >
              Save{" "}
              {this.state.list.type === "endpoints" &&
                `to ${this.renderListTitle()}`}
            </button>
          </Modal.Body>
        </div>
      </Modal>
    );
  }
}

export default connect(mapStateToProps, null)(CreateEndpointForm);
