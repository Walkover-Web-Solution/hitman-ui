import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import EnvironmentModal from "./environmentModal";
import environmentsService from "./environmentsService.js";
import shortId from "shortid";
import { connect } from "react-redux";
import { Table } from "react-bootstrap";
import {
  fetchEnvironments,
  addEnvironment,
  updateEnvironment,
  deleteEnvironment,
  setEnvironmentId
} from "./redux/environmentsActions";

const mapStateToProps = state => {
  return {
    environment: state.environment
  };
};

const mapDispatchToProps = dispatch => {
  return {
    fetchEnvironments: () => dispatch(fetchEnvironments()),
    addEnvironment: newEnvironment => dispatch(addEnvironment(newEnvironment)),
    updateEnvironment: editedEnvironment =>
      dispatch(updateEnvironment(editedEnvironment)),
    deleteEnvironment: deletedEnvironment =>
      dispatch(deleteEnvironment(deletedEnvironment)),
    setEnvironmentId: environmentId => dispatch(setEnvironmentId(environmentId))
  };
};

class Environments extends Component {
  state = {
    currentEnvironmentId: null,
    environmentFormName: null,
    showEnvironmentForm: false,
    showEnvironmentModal: false,
    environmentToBeEdited: {}
  };

  async componentDidMount() {
    this.props.fetchEnvironments();
  }

  handleEnvironmentModal(environmentFormName, environmentToBeEdited) {
    this.setState({
      environmentFormName,
      environmentToBeEdited
    });
  }
  handleEnv(environmentId) {
    this.props.setEnvironmentId(environmentId);
    this.setState({ currentEnvironmentId: environmentId });
  }

  async handleAdd(newEnvironment) {
    newEnvironment.requestId = shortId.generate();
    this.props.addEnvironment(newEnvironment);
  }

  openDeleteEnvironmentModal(environmentId) {
    this.setState({
      showDeleteModal: true,
      selectedEnvironment: {
        ...this.props.environment.environments[environmentId]
      }
    });
  }

  closeDeleteEnvironmentModal() {
    this.setState({ showDeleteModal: false });
  }

  render() {
    const env = this.props.environment.environments[
      this.props.environment.currentEnvironmentId
    ];

    return (
      <div className="environment-container">
        {(this.state.environmentFormName === "Add new Environment" ||
          this.state.environmentFormName === "Edit Environment") &&
          environmentsService.showEnvironmentForm(
            this.props,
            this.handleEnvironmentModal.bind(this),
            this.state.environmentFormName,
            this.state.environmentToBeEdited
          )}
        {this.state.environmentFormName === "Environment modal" && (
          <EnvironmentModal
            {...this.props}
            show={true}
            open_delete_environment_modal={this.openDeleteEnvironmentModal.bind(
              this
            )}
            close_delete_environment_modal={this.closeDeleteEnvironmentModal.bind(
              this
            )}
            onHide={() => this.handleEnvironmentModal()}
            handle_environment_modal={this.handleEnvironmentModal.bind(this)}
          />
        )}
        <div>
          {this.state.showDeleteModal &&
            environmentsService.showDeleteEnvironmentModal(
              this.props,
              this.closeDeleteEnvironmentModal.bind(this),
              "Delete Environment",
              `Are you sure you wish to delete this environment?`,
              this.state.selectedEnvironment
            )}
        </div>

        <div className="environment-buttons">
          <button
            className="btn btn-default"
            onClick={() => this.handleEnvironmentModal("Environment modal")}
          >
            <i class="fas fa-cog"></i>
          </button>
        </div>

        {/* start */}
        <div className="environment-buttons">
          <Dropdown className="float-right">
            <Dropdown.Toggle
              bsPrefix="dropdown"
              variant="default"
              id="dropdown-basic"
            >
              <i class="fas fa-eye"></i>
            </Dropdown.Toggle>

            <Dropdown.Menu alignRight className="custom-env-menu">
              <Dropdown.Item>
                {env ? env.name : "No Environment Selected"}

                {env ? (
                  <button
                    className="btn btn-default"
                    onClick={() =>
                      this.handleEnvironmentModal("Edit Environment", env)
                    }
                  >
                    Edit
                  </button>
                ) : (
                  <button
                    className="btn btn-default"
                    onClick={() =>
                      this.handleEnvironmentModal("Add new Environment")
                    }
                  >
                    Add
                  </button>
                )}
              </Dropdown.Item>
              <Dropdown.Divider />
              <div>
                {" "}
                <p className="custom-left-pane">VARIABLE</p>
                <p className="custom-middle-pane">INITIAL VALUE</p>
                <p className="custom-right-pane">CURRENT VALUE</p>
              </div>
              {env &&
                Object.keys(env.variables).map(v => (
                  <div>
                    <p className="custom-left-box">{v}</p>
                    <p className="custom-middle-box">
                      {env.variables[v].initialValue || "None"}
                    </p>
                    <p className="custom-right-box">
                      {env.variables[v].currentValue || "None"}
                    </p>
                  </div>
                ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>

        {/* end */}
        <div className="select-environment-dropdown">
          <Dropdown className="float-right">
            <Dropdown.Toggle variant="default" id="dropdown-basic">
              {this.props.environment.environments[
                this.props.environment.currentEnvironmentId
              ]
                ? this.props.environment.environments[
                    this.props.environment.currentEnvironmentId
                  ].name
                : "No Environment"}
            </Dropdown.Toggle>

            <Dropdown.Menu alignRight>
              <Dropdown.Item
                onClick={() => this.handleEnv(null)}
                key={"no-environment"}
              >
                No Environment
              </Dropdown.Item>
              {Object.keys(this.props.environment.environments).map(
                environmentId => (
                  <Dropdown.Item
                    onClick={() => this.handleEnv(environmentId)}
                    key={environmentId}
                  >
                    {this.props.environment.environments[environmentId].name}
                  </Dropdown.Item>
                )
              )}
              <button
                className="btn btn-default"
                onClick={() =>
                  this.handleEnvironmentModal("Add new Environment")
                }
              >
                + Add Environment
              </button>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Environments);
