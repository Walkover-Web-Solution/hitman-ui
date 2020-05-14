import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import "../main/main.scss";
import Form from "../common/form";
import Joi from "joi-browser";
import herokuApiService from "../../services/herokuApiService";
import endpointApiService from "../endpoints/endpointApiService";
import { connect } from "react-redux";
import jQuery from "jquery";
import { toast } from "react-toastify";

const mapStateToProps = (state) => {
  return {
    environment: state.environment,
  };
};

class PublishDocsModal extends Form {
  state = {
    data: {
      defaultTitle: "",
      defaultLogoUrl: "",
      newDomain: "",
      newTitle: "",
      newLogoUrl: "",
    },
    errors: { title: "" },
    selectedDomain: null,
    editableDocProperties: false,
  };

  schema = {
    title: Joi.string().required().label("Title"),
    domain: Joi.string().required().label("Domain"),
  };

  async doSubmit() {
    // this.props.add_custom_domain(
    //   this.state.data.domain,
    //   this.props.collection_id
    // );
    // await herokuApiService.updateConfigVars({
    //   [this.state.data
    //     .domain]: `${this.state.data.title},${this.props.collection_id}`,
    // });
    // const { data: response } = await herokuApiService.createDomain(
    //   this.state.data.domain
    // );
    // console.log(response.cname);

    // endpointApiService.apiTest(
    //   "https://api.msg91.com/api/v2/sendsms",
    //   "POST",
    //   {
    //     sender: "SOCKET",
    //     route: "4",
    //     country: "91",
    //     sms: [
    //       {
    //         message: `Successfully added ${this.state.data.domain} to your public collection. Please add ${response.cname} as CNAME in your DNS records.`,
    //         to: ["9666770339"],
    //       },
    //     ],
    //   },
    //   {
    //     authkey: "311584A9QCyvMghL5e10a184P1",
    //     "Content-Type": "application/json",
    //   }
    // );

    this.props.onHide();
  }

  selectEnvironment(envId) {
    const environment = jQuery.extend(
      true,
      {},
      this.props.environment.environments[envId]
    );

    let collection = {
      ...this.props.collections[this.props.collection_id],
      environment,
    };
    delete collection.teamId;
    this.props.update_collection(collection);

    // this.setState({ selectedEnvironmentId: envId });
  }

  // renderDomainProperties() {
  //   const domainProperties = this.props.collections[this.props.collection_id]
  //     .docProperties;
  //   let data = {};
  //   if (!this.state.selectedDomain) {
  //     data.title = domainProperties.defaultTitle;
  //     data.logoUrl = domainProperties.defaultLogoUrl;
  //   }
  //   else{

  //   }
  // }

  handleEditButton() {
    if (this.state.editableDocProperties === false)
      this.setState({ editableDocProperties: true });
    else {
      let docProperties = {
        defaultTitle: this.state.data.defaultTitle,
        defaultLogoUrl: this.state.data.defaultLogoUrl,
      };
      let collection = {
        ...this.props.collections[this.props.collection_id],
        docProperties,
      };
      delete collection.teamId;
      this.props.update_collection(collection);
      this.setState({ editableDocProperties: false });
    }
  }

  renderNewDomainForm() {
    return (
      <form>
        {this.renderInput("newDomain", "Domain", "Domain")}
        {this.renderInput("newTitle", "Title", "Title")}
        {this.renderInput("newLogoUrl", "Logo Url", "Logo Url")}

        <button
          onClick={() => {
            this.handleAddDomain();
            this.setState({ flag: false });
          }}
        >
          Add
        </button>
      </form>
    );
  }

  async handleAddDomain() {
    try {
      await herokuApiService.updateConfigVars({
        [this.state.data
          .domain]: `${this.state.data.newTitle},${this.state.data.newLogoUrl}${this.props.collection_id}`,
      });
      const { data: response } = await herokuApiService.createDomain(
        this.state.data.newDomain
      );
      this.props.add_custom_domain(
        this.props.collection_id,
        this.state.data.newDomain,
        response.cname,
        this.state.data.newTitle,
        this.state.data.newLogoUrl
      );
    } catch (error) {
      toast.error(error.response ? error.response.data : error);
    }
  }
  render() {
    console.log(this.props.collections[this.props.collection_id]);
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
          Environment
          <div class="dropdown">
            <button
              class="btn btn-secondary dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              {this.props.collections[this.props.collection_id].environment
                ? this.props.collections[this.props.collection_id].environment
                    .name
                : "No Environment"}
            </button>
            <div class="dropdown-menu" aria-labelledby="dropdownMenuButton">
              {Object.keys(this.props.environment.environments).map((e) => (
                <button
                  className="btn"
                  onClick={() => {
                    this.selectEnvironment(e);
                  }}
                >
                  {this.props.environment.environments[e].name}
                </button>
              ))}
            </div>
          </div>
          <div
            className="doc-properties-title"
            style={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
            }}
          >
            <h5>Doc Properties</h5>
            <button
              className="btn"
              onClick={() => {
                this.handleEditButton();
              }}
            >
              {this.state.editableDocProperties ? "Update" : "Edit"}
            </button>
          </div>
          <div className="doc-properites" style={{ border: "1px solid grey" }}>
            {this.state.editableDocProperties ? (
              <div>
                {this.renderInput("defaultTitle", "Title", "Title")}
                {this.renderInput("defaultLogoUrl", "Logo url", "Logo Url")}
              </div>
            ) : (
              <div>
                title{" "}
                <label>
                  {this.props.collections[this.props.collection_id]
                    .docProperties &&
                    this.props.collections[this.props.collection_id]
                      .docProperties.defaultTitle}
                </label>
                Logo Url{" "}
                <label>
                  {this.props.collections[this.props.collection_id]
                    .docProperties &&
                    this.props.collections[this.props.collection_id]
                      .docProperties.defaultlogoUrl}
                </label>
              </div>
            )}
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
              {this.props.collections[this.props.collection_id] &&
                this.props.collections[this.props.collection_id]
                  .docProperties &&
                this.props.collections[this.props.collection_id].docProperties
                  .domainsList &&
                this.props.collections[
                  this.props.collection_id
                ].docProperties.domainsList.map((d) => (
                  <tr
                    onClick={() => {
                      console.log(d.domain);
                    }}
                  >
                    <td>{d.domain}</td>
                    <td>{d.dnsTarget}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {this.state.flag ? (
            <div>{this.renderNewDomainForm()}</div>
          ) : (
            <button
              onClick={() => {
                this.setState({ flag: true });
              }}
            >
              Add domain
            </button>
          )}
          {/* {this.renderDomainProperties()} */}
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
        {/* <Modal.Footer>
          <button
            id="custom-delete-modal-delete"
            className="btn btn-default custom-button"
            onClick={this.handleSubmit}
          >
            Delete
          </button>
          <button
            id="custom-delete-modal-cancel"
            className="btn btn-default custom-button"
            onClick={this.props.onHide}
          >
            Cancel
          </button>
        </Modal.Footer>*/}
      </Modal>
    );
  }
}

export default connect(mapStateToProps, null)(PublishDocsModal);
