import React from "react";
import { Modal } from "react-bootstrap";
import "./publicEndpoint.scss";
import Form from "../common/form";
import Joi from "joi-browser";
import { connect } from "react-redux";
import jQuery from "jquery";
import { toast } from "react-toastify";
import { CopyToClipboard } from "react-copy-to-clipboard";
import cirlceCiApiService from "../../services/circleCiApiService";

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
    domainPropertiesShowFlags: {},
  };

  componentDidMount() {
    if (this.props.collections[this.props.collection_id].docProperties) {
      let domainPropertiesShowFlags = {};
      let data = {};
      this.props.collections[
        this.props.collection_id
      ].docProperties.domainsList.forEach((d) => {
        domainPropertiesShowFlags[d.domain] = {
          show: false,
          isEditable: false,
        };
        data[`${d.domain}-title`] = d.title;
        data[`${d.domain}-logoUrl`] = d.logoUrl;
      });

      data = {
        ...data,
        defaultTitle: this.props.collections[this.props.collection_id]
          .docProperties.defaultTitle,
        defaultLogoUrl: this.props.collections[this.props.collection_id]
          .docProperties.defaultLogoUrl,
      };
      this.setState({
        data,
        domainPropertiesShowFlags,
      });
    }
  }

  schema = {
    title: Joi.string().required().label("Title"),
    domain: Joi.string().required().label("Domain"),
  };

  async doSubmit() {
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
  }

  handleEditButton(operation) {
    if (operation === "cancel") {
      this.setState({ editableDocProperties: false });
      return;
    }
    if (this.state.editableDocProperties === false)
      this.setState({ editableDocProperties: true });
    else {
      let docProperties = {
        ...this.props.collections[this.props.collection_id].docProperties,
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
    const index = this.props.collections[
      this.props.collection_id
    ].docProperties.domainsList.findIndex(
      (d) => d.domain === this.state.data.newDomain
    );
    if (index >= 0) {
      toast.error("Domain already added to this doc.");
      return;
    }
    try {
      cirlceCiApiService.addEnvVariable('REACT_APP_CUSTOM_DOMAINS_LIST',process.env.REACT_APP_CUSTOM_DOMAINS_LIST+`;${this.state.data.newDomain},${this.props.collection_id}`)
      
      this.props.update_collection({
        customDomain: this.state.data.newDomain,
        id:this.props.collection_id
      });
      const domainPropertiesShowFlags = {
        ...this.state.domainPropertiesShowFlags,
        [this.state.newDomain]: { show: false, isEditable: false },
      };
      this.setState({ domainPropertiesShowFlags });
    } catch (error) {
      toast.error(error.response ? error.response.data : error);
    }
  }

  renderDocProperties(title, logoUrl) {
    return (
      <div className="doc-properites">
        <div className="doc-properties-item">
          <label>Page Title</label>
          <label>{title}</label>
        </div>
        <div className="doc-properties-item">
          <label>Logo Url</label>
          <label>{logoUrl}</label>
        </div>
      </div>
    );
  }
  renderDocPropertiesForm(title, logoUrl) {
    return (
      <div className="doc-properites">
        {this.renderInput(title, "Page Title", "Page Title")}
        {this.renderInput(logoUrl, "Logo Url", "Logo Url")}
      </div>
    );
  }

  showDocProperties(domain) {
    let domainPropertiesShowFlags = {
      ...this.state.domainPropertiesShowFlags,
    };
    domainPropertiesShowFlags[domain].show = !domainPropertiesShowFlags[domain]
      .show;
    this.setState({ domainPropertiesShowFlags });
  }

  makeDomainPropertiesEditable(domain, isEditable) {
    let domainPropertiesShowFlags = {
      ...this.state.domainPropertiesShowFlags,
    };
    domainPropertiesShowFlags[domain].isEditable = isEditable;
    this.setState({ domainPropertiesShowFlags });
  }

  updateDomainProperties(domain) {
    let docProperties = {
      ...this.props.collections[this.props.collection_id].docProperties,
    };
    const index = docProperties.domainsList.findIndex(
      (d) => d.domain === domain
    );
    docProperties.domainsList[index].title = this.state.data[`${domain}-title`];
    docProperties.domainsList[index].logoUrl = this.state.data[
      `${domain}-logoUrl`
    ];
    let collection = {
      ...this.props.collections[this.props.collection_id],
      docProperties,
    };
    delete collection.teamId;
    this.props.update_collection(collection);
    this.makeDomainPropertiesEditable(domain, false);
  }
  handleMakePublic(collection) {
    collection.isPublic = !collection.isPublic;
    delete collection.teamId;
    this.props.update_collection({ ...collection });
  }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        animation={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
        className="public-doc-modal"
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

          <div className="doc-properties-title">
            <h5>Doc Properties</h5>
            {this.state.editableDocProperties ? (
              <div className="button-group">
                <button
                  className="btn doc-properties-cancel-button"
                  onClick={() => {
                    this.handleEditButton("cancel");
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn doc-properties-edit-button"
                  onClick={() => {
                    this.handleEditButton("update");
                  }}
                >
                  Update
                </button>
              </div>
            ) : (
              <button
                className="btn doc-properties-edit-button"
                onClick={() => {
                  this.handleEditButton("edit");
                }}
              >
                Edit
              </button>
            )}
          </div>
          <div>
            {this.state.editableDocProperties
              ? this.renderDocPropertiesForm("defaultTitle", "defaultLogoUrl")
              : this.renderDocProperties(
                  this.props.collections[this.props.collection_id]
                    .docProperties &&
                    this.props.collections[this.props.collection_id]
                      .docProperties.defaultTitle,
                  this.props.collections[this.props.collection_id]
                    .docProperties &&
                    this.props.collections[this.props.collection_id]
                      .docProperties.defaultLogoUrl
                )}
          </div>
          <h5>Custom domain</h5>
          Please map your domain to {process.env.REACT_APP_UI_IP} after adding here.
          <table className="table domain-list-table">
            <thead>
              <tr>
                <th scope="col" className="domain-name-column-heading">
                  Domain name
                </th>
              </tr>
            </thead>
            <tbody>
              {this.props.collections[this.props.collection_id] &&
              this.props.collections[this.props.collection_id].docProperties &&
              this.props.collections[this.props.collection_id].docProperties
                .domainsList &&
              this.props.collections[this.props.collection_id].docProperties
                .domainsList.length > 0 ? (
                this.props.collections[
                  this.props.collection_id
                ].docProperties.domainsList.map((d, index) => (
                  <div>
                    <tr key={index}>
                      <td
                        className="domain-name-column-item"
                        onClick={() => {
                          this.showDocProperties(d.domain);
                        }}
                      >
                        {d.domain}
                      </td>
                    </tr>
                    {this.state.domainPropertiesShowFlags[d.domain] &&
                      this.state.domainPropertiesShowFlags[d.domain].show && (
                        <div>
                          {this.state.domainPropertiesShowFlags[d.domain]
                            .isEditable
                            ? this.renderDocPropertiesForm(
                                `${d.domain}-title`,
                                `${d.domain}-logoUrl`
                              )
                            : this.renderDocProperties(d.title, d.logoUrl)}
                          <div className="button-group">
                            {this.state.domainPropertiesShowFlags[d.domain]
                              .isEditable ? (
                              <button
                                className="btn cancel-button"
                                onClick={() => {
                                  this.makeDomainPropertiesEditable(
                                    d.domain,
                                    false
                                  );
                                }}
                              >
                                Cancel
                              </button>
                            ) : null}
                            {this.state.domainPropertiesShowFlags[d.domain]
                              .isEditable ? (
                              <button
                                className="btn doc-properties-edit-button"
                                onClick={() => {
                                  this.updateDomainProperties(d.domain);
                                }}
                              >
                                Update
                              </button>
                            ) : (
                              <button
                                className="btn doc-properties-edit-button"
                                onClick={() => {
                                  this.makeDomainPropertiesEditable(
                                    d.domain,
                                    true
                                  );
                                }}
                              >
                                Edit
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                ))
              ) : (
                <div
                  className="no-domain-message"
                  style={{ textAlign: "center" }}
                >
                  There is no domain added to this doc.
                </div>
              )}
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
            style={{ float: "left", marginLeft: "10px" }}
            type="button"
            className="btn make-public-button"
            onClick={() => {
              this.handleMakePublic(
                this.props.collections[this.props.collection_id]
              );
            }}
          >
            {this.props.collections[this.props.collection_id].isPublic
              ? "Make Private"
              : "Make Public"}
          </button>

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
