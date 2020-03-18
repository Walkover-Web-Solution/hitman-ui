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
    this.props.deleteUserFromTeam({ teamIdentifier: teamId, email });
  }

  render() {
    console.log("render", this.props);
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
            <ListGroup>
              {Object.keys(this.props.team).map(teamId => (
                <div>
                  <ListGroup.Item
                    style={{ width: "50%", float: "left" }}
                    key={1}
                  >
                    {this.props.team[teamId].email}
                  </ListGroup.Item>

                  <ListGroup.Item
                    style={{ width: "40%", float: "left" }}
                    key={2}
                  >
                    {this.props.team[teamId].role}
                  </ListGroup.Item>

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
                    style={{ float: "right" }}
                  >
                    X
                  </button>
                </div>
              ))}
            </ListGroup>

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
