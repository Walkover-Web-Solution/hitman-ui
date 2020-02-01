import React, { Component } from "react";
import {
  Accordion,
  Card,
  Button,
  Dropdown,
  DropdownButton
} from "react-bootstrap";
import { Route, Switch, Link } from "react-router-dom";
import EnvironmentForm from "./environmentForm";
import environmentService from "../services/environmentService";
import EnvironmentModal from "./environmentModal";
import EnvironmentVariables from "./environmentVariables";
import variablesService from "../services/variablesService";

class Environments extends Component {
  state = {
    environments: [],
    variables: [],
    environment: { id: 0, name: "No Environment" }
  };

  async fetchVariables(environments) {
    let variables = [];
    for (let i = 0; i < environments.length; i++) {
      const { data: variables1 } = await variablesService.getVariables(
        environments[i].id
      );
      variables = [...variables, ...variables1];
    }

    return variables;
  }

  async componentDidMount() {
    const { data: environments } = await environmentService.getEnvironments();
    this.setState({ environments });
    const variables = await this.fetchVariables(environments);
    this.setState({ variables });
  }

  handleEnv(environment) {
    this.setState({ environment: environment });
  }

  handleEdit(environment) {}

  async handleAdd(environment) {
    const environments = [...this.state.environments, environment];
    this.setState({ environments });
    await environmentService.saveEnvironment(environment);
  }

  render() {
    if (this.props.location.variables) {
      const { variables } = this.props.location;
      this.props.history.replace({ variables: null });
      this.setState({ variables });
    }
    if (this.props.location.environments) {
      const { environments } = this.props.location;
      this.props.history.replace({ environments: null });
      this.setState({ environments });
    }

    if (this.props.location.deleteEnvironmentId) {
      const { deleteEnvironmentId } = this.props.location;
      this.props.history.replace({ deleteEnvironmentId: null });
      this.handleDelete(deleteEnvironmentId);
    }

    if (this.props.location.newEnvironment) {
      const { newEnvironment } = this.props.location;
      this.props.history.replace({ newEnvironment: null });
      this.handleAdd(newEnvironment);
    }
    return (
      <div>
        <div>
          <Switch>
            <Route
              path="/collections/environments/variables"
              render={props => (
                <EnvironmentVariables
                  {...props}
                  show={true}
                  onHide={() => {}}
                  environments={this.state.environments}
                  variables={this.state.variables}
                />
              )}
            />
            <Route
              path="/collections/environments/manage/edit"
              render={props => (
                <EnvironmentForm
                  {...props}
                  show={true}
                  onHide={() => {}}
                  title="Edit Environment"
                />
              )}
            />
            <Route
              path="/collections/environments/manage"
              render={props => (
                <EnvironmentModal
                  {...props}
                  show={true}
                  onHide={() => {}}
                  environments={this.state.environments}
                />
              )}
            />
            <Route
              path="/collections/environments/new"
              render={props => (
                <EnvironmentForm
                  {...props}
                  show={true}
                  onHide={() => {}}
                  title="Add new Environment"
                />
              )}
            />
          </Switch>
        </div>
        <div className="Environment Dropdown">
          <Dropdown className="float-right">
            <Dropdown.Toggle variant="default" id="dropdown-basic">
              {this.state.environment.name}
            </Dropdown.Toggle>

            <Dropdown.Menu alignRight>
              <Dropdown.Item>
                <Link to="/collections/environments/new">
                  + Add Environment
                </Link>
              </Dropdown.Item>

              {this.state.environments.map(environment => (
                <Dropdown.Item onClick={() => this.handleEnv(environment)}>
                  {environment.name}
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </div>
        <div style={{ textAlign: "left" }}>
          <button type="button" class="btn btn-link btn-sm btn-block">
            <i class="fa fa-eye"></i>{" "}
          </button>
          <Link to="/collections/environments/manage">Manage Environments</Link>
        </div>
        <div style={{ textAlign: "right" }}>
          <Link to="/collections/environments/variables">
            Environment Variables
          </Link>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3>{this.state.environment.name}</h3>
        </div>
      </div>
    );
  }
}

export default Environments;
