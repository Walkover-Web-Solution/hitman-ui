import React from "react";
import Form from "./common/form";
import { Modal } from "react-bootstrap";
import Joi from "joi-browser";
import pageService from "../services/pageService";
import { Link } from "react-router-dom";

class PageForm extends Form {
  state = {
    data: {
      name: "",
      contents: ""
    },
    errors: {}
  };

  schema = {
    name: Joi.string()
      .required()
      .label("Page name"),
    contents: Joi.string()
      .required()
      .label("Contents")
  };

  async doSubmit(props) {
    console.log("props of pageform", this.props);
    if (this.props.title === "Add New Page") {
      this.props.history.push({
        pathname: `/collections`,
        newPage: this.state.data,
        versionId: parseInt(this.props.location.pathname.split("/")[4]),
        groupId: parseInt(this.props.location.pathname.split("/")[6])
      });
    }
    if (this.props.title === "Add New Version Page") {
      this.props.history.push({
        pathname: `/collections`,
        newPage: this.state.data,
        versionId: parseInt(this.props.location.pathname.split("/")[4])
      });
    }
    // versionId: parseInt(this.props.location.versionId),
    // groupId: parseInt(this.props.location.groupId)

    // collectionId: this.props.location.pathname.split("/")[2]

    // }

    if (this.props.title === "Edit Page") {
      this.props.history.push({
        pathname: `/collections`,
        editedPage: this.state.data,
        pageId: this.state.pageId,
        versionId: this.state.versionId
      });
    }
  }

  render() {
    console.log("prope", this.props);
    if (this.props.editPage) {
      const { id, versionId, name, contents } = this.props.editPage;
      this.state.pageId = id;
      this.state.versionId = versionId;
      this.state.data.name = name;
      this.state.data.contents = contents;
      // this.props.history.replace({ editPage: null });
    }
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
            {this.renderInput("name", "Page name")}
            {this.renderInput("contents", "Contents*")}
            {this.renderButton("Submit")}
            <Link to={`/collections`}>Cancel</Link>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default PageForm;
