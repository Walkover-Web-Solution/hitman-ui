import React, { Component } from "react";
import { Dropdown } from "react-bootstrap";
import EnvironmentModal from "./environmentModal";
import environmentsService from "./environmentsService.js";
import shortId from "shortid";
import { connect } from "react-redux";
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

  render() {
    return (
      <div>
        <div>
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
              onHide={() => this.handleEnvironmentModal()}
              handle_environment_modal={this.handleEnvironmentModal.bind(this)}
            />
          )}
        </div>
        <div style={{ textAlign: "left" }}>
          <button
            className="btn btn-default"
            onClick={() => this.handleEnvironmentModal("Environment modal")}
            style={{ float: "right" }}
          >
            <i>
              <svg width="20" height="20">
                <circle
                  cx="10"
                  cy="10"
                  r="10"
                  stroke="black"
                  stroke-width=".4"
                  fill="grey"
                />
              </svg>
            </i>
          </button>
        </div>
        <div className="Environment Dropdown">
          <Dropdown className="float-right">
            <Dropdown.Toggle variant="default" id="dropdown-basic">
              {this.props.environment.environments[
                this.props.environment.currentEnvironmentId
              ] &&
                this.props.environment.environments[
                  this.props.environment.currentEnvironmentId
                ].name}
            </Dropdown.Toggle>

            <Dropdown.Menu alignRight>
              <button
                className="btn btn-default"
                onClick={() =>
                  this.handleEnvironmentModal("Add new Environment")
                }
              >
                + Add Environment
              </button>

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
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
    );
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Environments);
