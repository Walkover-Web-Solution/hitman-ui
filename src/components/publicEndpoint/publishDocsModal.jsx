import React, { Component } from "react";
import { Modal } from "react-bootstrap";
import "./publicEndpoint.scss";
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

  componentDidMount() {
    if (this.props.collections[this.props.collection_id].docProperties) {
      this.setState({
        data: {
          defaultTitle: this.props.collections[this.props.collection_id]
            .docProperties.defaultTitle,
          defaultLogoUrl: this.props.collections[this.props.collection_id]
            .docProperties.defaultLogoUrl,
        },
      });
    }
  }

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
    let environment = {};
    if (envId) {
      environment = jQuery.extend(
        true,
        {},
        this.props.environment.environments[envId]
      );
    } else {
      environment = null;
    }

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
        ...this.props.collections[this.props.collection_id].docProperties,
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
      <form
        className="add-new-domain-form"
        onSubmit={() => {
          this.handleAddDomain();
          this.setState({ flag: false });
        }}
      >
        {this.renderInput("newDomain", "Domain", "Domain")}
        {this.renderInput("newTitle", "Title", "Title")}
        {this.renderInput("newLogoUrl", "Logo Url", "Logo Url")}

        <div className="button-group">
          <button
            className="btn cancel-button"
            onClick={() => {
              this.setState({ flag: false });
            }}
          >
            Cancel
          </button>

          <button
            className="btn submit-button"
            onClick={() => {
              this.handleAddDomain();
              this.setState({ flag: false });
            }}
          >
            Add
          </button>
        </div>
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
      console.log(response.cname);
      this.props.add_custom_domain(
        this.props.collection_id,
        this.state.data.newDomain,
        response.cname,
        this.state.data.newTitle,
        this.state.data.newLogoUrl
      );
    } catch (error) {
      console.log(error);
      toast.error(error.response ? error.response.data : error);
    }
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
            Publish Docs
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="publish-doc-body">
          <h5>Environment</h5>
          <div className="dropdown">
            <button
              className="btn dropdown-toggle"
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
            <div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <button
                className="btn"
                onClick={() => {
                  this.selectEnvironment();
                }}
              >
                No Environment
              </button>
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
          <div>
            {this.state.editableDocProperties ? (
              <div className="doc-properites">
                {this.renderInput("defaultTitle", "Page Title", "Page Title")}
                {this.renderInput("defaultLogoUrl", "Logo Url", "Logo Url")}
              </div>
            ) : (
              <div className="doc-properites">
                <div className="doc-properties-item">
                  <label>Page Title</label>
                  <label>
                    {this.props.collections[this.props.collection_id]
                      .docProperties &&
                      this.props.collections[this.props.collection_id]
                        .docProperties.defaultTitle}
                  </label>
                </div>
                <div className="doc-properties-item">
                  <label>Logo Url</label>
                  <label>
                    {this.props.collections[this.props.collection_id]
                      .docProperties &&
                      this.props.collections[this.props.collection_id]
                        .docProperties.defaultLogoUrl}
                  </label>
                </div>
              </div>
            )}
          </div>
          <h5>Custom domain</h5>
          <table className="table domain-list-table">
            <thead>
              <tr>
                <th scope="col" className="domain-name-column-heading">
                  Domain name
                </th>
                <th scope="col" className="dns-target-column-heading">
                  DNS Target
                </th>
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
                ].docProperties.domainsList.map((d, index) => (
                  <tr
                    onClick={() => {
                      console.log(d.domain);
                    }}
                    key={index}
                  >
                    <td className="domain-name-column-item">{d.domain}</td>
                    <td className="dns-target-column-item">{d.dnsTarget}</td>
                  </tr>
                ))}
              {this.state.flag ? (
                <div>{this.renderNewDomainForm()}</div>
              ) : (
                <div className="btn add-domain-button-wrapper">
                  <button
                    className="btn add-domain-button"
                    onClick={() => {
                      this.setState({ flag: true });
                    }}
                  >
                    Add domain
                  </button>
                </div>
              )}
            </tbody>
          </table>
        </Modal.Body>
        <Modal.Footer>
          <button
            id="custom-delete-modal-cancel"
            className="btn btn-default custom-button"
            onClick={this.props.onHide}
          >
            Close
          </button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect(mapStateToProps, null)(PublishDocsModal);
