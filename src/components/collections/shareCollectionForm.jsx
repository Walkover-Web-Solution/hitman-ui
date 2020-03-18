import Joi from "joi-browser";
import React from "react";
import { Dropdown, ListGroup, Modal } from "react-bootstrap";
import Form from "../common/form";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    team: state.team
  };
};

class ShareCollectionForm extends Form {
  state = {
    data: {
      email: ""
    },
    errors: {},
    role: null
  };

  async componentDidMount() {
    this.props.fetchAllUsersOfTeam(this.props.team_id);
  }

  schema = {
    email: Joi.string()
      .required()
      .label("email")
  };

  dropdownRole = {
    admin: { name: "Admin" },
    collaborator: { name: "Collaborator" }
  };

  setDropdownRole(key) {
    const role = this.dropdownRole[key].name;
    this.setState({
      role
    });
  }

  async onShareCollectionSubmit(teamMember) {
    this.props.onHide();
    this.props.shareCollection(teamMember);
    this.setState({
      data: {
        email: ""
      },
      errors: {},
      role: null
    });
  }
  async doSubmit() {
    const teamMember = {
      email: this.state.data.email,
      role: this.state.role,
      teamIdentifier: this.props.team_id
    };
    this.onShareCollectionSubmit(teamMember);
  }

  handleDelete(teamId, email) {
    console.log("in delete");
    this.props.deleteUserFromTeam({ teamIdentifier: teamId, email });
  }

  render() {
    let count = Object.keys(this.props.team).length;
    let serialNo = 1;
    return (
      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            {this.props.title}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={this.handleSubmit}>
            <div className="row">
              <div className="col">
                {this.renderInput("email", "Email-id", "email")}
              </div>
              <div className="col">
                <Dropdown>
                  <Dropdown.Toggle variant="success" id="dropdown-basic">
                    {this.state.role ? this.state.role : "Role"}
                  </Dropdown.Toggle>
                  <Dropdown.Menu>
                    {Object.keys(this.dropdownRole).map(key => (
                      <Dropdown.Item onClick={() => this.setDropdownRole(key)}>
                        {this.dropdownRole[key].name}
                      </Dropdown.Item>
                    ))}
                  </Dropdown.Menu>
                </Dropdown>{" "}
              </div>
            </div>
            <br />
            <table class="table table-striped">
              <thead class="thead-dark">
                <tr>
                  <th scope="col"></th>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              {Object.keys(this.props.team).map(teamId => (
                <tbody>
                  <tr>
                    <th scope="row">{serialNo++}</th>
                    <td>{this.props.team[teamId].email}</td>
                    <td> {this.props.team[teamId].role}</td>
                    <button
                      className="btn btn-default"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to remove member from the team?"
                          )
                        )
                          this.handleDelete(
                            this.props.team_id,
                            this.props.team[teamId].email
                          );
                      }}
                    >
                      X
                    </button>
                  </tr>
                </tbody>
              ))}
            </table>

            {this.renderButton("Share")}
            <button
              className="btn btn-default"
              onClick={() => this.props.onHide()}
            >
              Cancel
            </button>
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default connect(mapStateToProps, null)(ShareCollectionForm);
