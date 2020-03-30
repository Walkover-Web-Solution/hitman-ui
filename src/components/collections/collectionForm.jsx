import React from "react";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import Form from "../common/form";
import shortid from "shortid";
import { connect } from "react-redux";
import { addCollection, updateCollection } from "./redux/collectionsActions";

const mapDispatchToProps = dispatch => {
  return {
    addCollection: newCollection => dispatch(addCollection(newCollection)),
    updateCollection: editedCollection =>
      dispatch(updateCollection(editedCollection))
  };
};

class CollectionForm extends Form {
  state = {
    data: {
      name: "",
      website: "",
      description: "",
      keyword: "",
      keyword1: "",
      keyword2: ""
    },
    collectionId: "",
    errors: {},
    show: true
  };

  async componentDidMount() {
    if (!this.props.show || this.props.title === "Add new Collection") return;
    let data = {};
    const collectionId = this.props.edited_collection.id;
    if (this.props.edited_collection) {
      const {
        name,
        website,
        description,
        keyword
      } = this.props.edited_collection;
      data = {
        name,
        website,
        description,
        keyword: keyword.split(",")[0],
        keyword1: keyword.split(",")[1],
        keyword2: keyword.split(",")[2]
      };
    }
    this.setState({ data, collectionId });
  }

  schema = {
    name: Joi.string()
      .required()
      .label("Username"),
    website: Joi.string()
      .required()
      .label("Website"),
    keyword: Joi.string()
      .required()
      .label("Keywords"),
    keyword1: Joi.string()
      .allow(null, "")
      .label("Keywords"),
    keyword2: Joi.string()
      .allow(null, "")
      .label("Keywords"),
    description: Joi.string()
      .allow(null, "")
      .label("description")
  };

  async onEditCollectionSubmit() {
    this.props.onHide();
    this.props.updateCollection({
      ...this.state.data,
      id: this.state.collectionId
    });
    this.setState({
      data: {
        name: "",
        website: "",
        description: "",
        keyword: "",
        keyword1: "",
        keyword2: ""
      }
    });
  }

  async onAddCollectionSubmit() {
    this.props.onHide();
    const requestId = shortid.generate();
    this.props.addCollection({ ...this.state.data, requestId });
    this.setState({
      data: {
        name: "",
        website: "",
        description: "",
        keyword: "",
        keyword1: "",
        keyword2: ""
      }
    });
  }

  async doSubmit() {
    var body = this.state.data;
    body.keyword = body.keyword + "," + body.keyword1 + "," + body.keyword2;
    delete body.keyword1;
    delete body.keyword2;
    if (this.props.title === "Edit Collection") {
      this.onEditCollectionSubmit();
    }
    if (this.props.title === "Add new Collection") {
      this.onAddCollectionSubmit();
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
              {this.renderInput("name", "Name", "Collection Name")}
              {this.renderInput("website", "Website", "Website")}
              <div className="row">
                <div className="col">
                  {this.renderInput("keyword", "Keyword 1", "Keyword 1")}
                </div>
                <div className="col">
                  {this.renderInput("keyword1", "Keyword 2", "Keyword 2")}
                </div>
                <div className="col">
                  {this.renderInput("keyword2", "Keyword 3", "Keyword 3")}
                </div>
              </div>
              {this.renderTextArea("description", "Description", "description")}
              {this.renderButton("Submit")}
              <button
                className="btn btn-default custom-button"
                onClick={() => this.props.onHide()}
              >
                Cancel
              </button>
            </form>
          </Modal.Body>
        </div>
      </Modal>
    );
  }
}

export default connect(null, mapDispatchToProps)(CollectionForm);
