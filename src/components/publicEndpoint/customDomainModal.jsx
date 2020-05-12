import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import "../main/main.scss";
import Form from "../common/form";
import Joi from "joi-browser";
import herokuApiService from "../../services/herokuApiService";
import endpointApiService from "../endpoints/endpointApiService";

class CustomDomainModal extends Form {
  state = {
    data: { title: "" },
    errors: { title: "" },
    showCollectionForm: false,
    showEnvironmentForm: false,
  };

  schema = {
    title: Joi.string().required().label("Title"),
    domain: Joi.string().required().label("Domain"),
  };

  async doSubmit() {
    this.props.add_custom_domain(
      this.state.data.domain,
      this.props.collection_id
    );
    await herokuApiService.updateConfigVars({
      [this.state.data
        .domain]: `${this.state.data.title},${this.props.collection_id}`,
    });
    const { data: response } = await herokuApiService.createDomain(
      this.state.data.domain
    );
    console.log(response.cname);

    endpointApiService.apiTest(
      "https://api.msg91.com/api/v2/sendsms",
      "POST",
      {
        sender: "SOCKET",
        route: "4",
        country: "91",
        sms: [
          {
            message: `Successfully added ${this.state.data.domain} to your public collection. Please add ${response.cname} as CNAME in your DNS records.`,
            to: ["9666770339"],
          },
        ],
      },
      {
        authkey: "311584A9QCyvMghL5e10a184P1",
        "Content-Type": "application/json",
      }
    );

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
        <Modal.Header className="custom-collection-modal-container" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Add Custom Domain
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            {this.renderInput("title", "Title", "Title")}
            {this.renderInput("domain", "Domain", "Domain")}
            {/* {this.renderInput("host", "Host", "host name")} */}
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

export default CustomDomainModal;
