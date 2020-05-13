import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import "../main/main.scss";
import Form from "../common/form";
import Joi from "joi-browser";
import herokuApiService from "../../services/herokuApiService";
import endpointApiService from "../endpoints/endpointApiService";

class PublishDocsModal extends Form {
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
            Publish Docs{" "}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Env
          <div class="dropdown">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              env
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <a class="dropdown-item" href="#">
                Action
              </a>
              <a class="dropdown-item" href="#">
                Another action
              </a>
              <a class="dropdown-item" href="#">
                Something else here
              </a>
            </div>
          </div>
          Custom domain
          <table class="table">
            <thead>
              <tr>
                <th scope="col">Domain name</th>
                <th scope="col">DNS Target</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Otto</td>
                <td>@mdo</td>
              </tr>
              <tr>
                <td>Thornton</td>
                <td>@fat</td>
              </tr>
              <tr>
                <td>the Bird</td>
                <td>@twitter</td>
              </tr>
            </tbody>
          </table>
          {this.state.flag ? (
            <div>
              <input />
              <button
                onClick={() => {
                  this.setState({ flag: false });
                }}
              >
                Add
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                this.setState({ flag: true });
              }}
            >
              Add domain
            </button>
          )}{" "}
          <br></br>
          Title
          <input type="text" /> <br></br>
          Logo
          <input type="text" placeholder="url of favicon logo"></input>
          {/* <form onSubmit={this.handleSubmit}>
            {this.renderInput("title", "Title", "Title")}
            {this.renderInput("domain", "Domain", "Domain")}
            {this.renderButton("Submit")}
            <button
              className="btn btn-default  custom-button"
              onClick={this.props.onHide}
            >
              Cancel
            </button>
          </form> */}
        </Modal.Body>
      </Modal>
    );
  }
}

export default PublishDocsModal;
