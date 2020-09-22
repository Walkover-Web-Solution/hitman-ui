import React from "react";
import { Modal } from "react-bootstrap";
import Form from "../common/form";

class TagManagerModal extends Form {
  state = {
    data: { gtmId: "" },
    errors: {},
  };

  componentDidMount() {
    let data = { gtmId: "" };
    if (this.props.collection_id) {
      data.gtmId = this.props.collections[this.props.collection_id].gtmId;
    }
    this.setState({ data });
  }

  async doSubmit() {
    let updatedCollection = this.props.collections[this.props.collection_id];
    delete updatedCollection.teamId;
    updatedCollection.gtmId = this.state.data.gtmId;
    this.props.update_collection(updatedCollection);
    this.props.onHide();
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        animation={false}
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
              {this.renderInput("gtmId", "GTM-ID", "")}
              <button
                className="btn btn-default custom-button"
                style={{ borderRadius: "12px" }}
                type="button"
                onClick={() => this.doSubmit()}
              >
                {"Submit"}
              </button>
            </form>
          </Modal.Body>
        </div>
      </Modal>
    );
  }
}

export default TagManagerModal;
