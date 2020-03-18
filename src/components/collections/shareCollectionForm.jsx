import Joi from "joi-browser";
import { Component, default as React } from "react";
// import Form from "../common/form";
import { Button, Dropdown, InputGroup, Modal } from "react-bootstrap";
import { ReactMultiEmail } from "react-multi-email";
import "react-multi-email/style.css";
import { connect } from "react-redux";

const mapStateToProps = state => {
  return {
    team: state.team
  };
};

class ShareCollectionForm extends Component {
  state = {
    data: {
      role: null
    },
    errors: {},
    teamMembers: []
  };

  async componentDidMount() {
    this.props.fetchAllUsersOfTeam(this.props.team_id);
  }

  schema = {
    email: Joi.string()
      .required()
      .label("email"),
    role: Joi.string().optional(),
    teamIdentifier: Joi.string()
  };

  dropdownRole = {
    admin: { name: "Admin" },
    collaborator: { name: "Collaborator" }
  };

  setDropdownRole(key) {
    const data = this.state.data;
    data.role = this.dropdownRole[key].name;
    this.setState({
      data
    });
  }
  async onShareCollectionSubmit(teamMemberData) {
    this.props.onHide();
    this.props.shareCollection(teamMemberData);
    this.setState({
      data: {
        email: "",
        role: null
      },
      errors: {}
    });
  }
  validate(teamMember) {
    const errors = Joi.validate(teamMember, this.schema, {
      abortEarly: false
    });
    console.log("errors", errors);
  }

  addMember() {
    let teamMembers = this.state.teamMembers;
    const len = teamMembers.length;
    teamMembers[len.toString()] = {
      email: this.emails[len.toString()],
      role: this.state.data.role,
      teamIdentifier: this.props.team_id
    };
    this.validate(teamMembers[len.toString()]);

    console.log(teamMembers);
    this.setState({ teamMembers });
  }

  async doSubmit() {
    this.onShareCollectionSubmit(this.state.teamMembers);
  }

  handleDelete(teamId, email) {
    console.log("in delete");
    this.props.deleteUserFromTeam({ teamIdentifier: teamId, email });
  }

  render() {
    let count = Object.keys(this.props.team).length;
    let serialNo = 1;
    const { emails } = this.state;
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
              <InputGroup>
                <ReactMultiEmail
                  name="email"
                  placeholder="Email-id"
                  emails={emails}
                  onChange={_emails => {
                    this.emails = _emails;
                  }}
                  // validateEmail={email => {
                  //   return isEmail(email);
                  // }}
                  getLabel={(email, index, removeEmail) => {
                    return (
                      <div data-tag key={index}>
                        {email}
                        <span
                          data-tag-handle
                          onClick={() => removeEmail(index)}
                        >
                          ×
                        </span>
                      </div>
                    );
                  }}
                />
                <InputGroup.Append>
                  <Dropdown>
                    <Dropdown.Toggle variant="success" id="dropdown-basic">
                      {this.state.data.role ? this.state.data.role : "Role"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {Object.keys(this.dropdownRole).map(key => (
                        <Dropdown.Item
                          onClick={() => this.setDropdownRole(key)}
                        >
                          {this.dropdownRole[key].name}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>{" "}
                  <Button variant="success" onClick={() => this.addMember()}>
                    Add
                  </Button>
                </InputGroup.Append>
              </InputGroup>
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
            <button className="btn btn-default" onClick={() => this.doSubmit()}>
              Share
            </button>
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
