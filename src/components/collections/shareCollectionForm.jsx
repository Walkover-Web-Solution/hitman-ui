import Joi from "joi-browser";
import { Component, default as React } from "react";
// import Form from "../common/form";
import { Button, Dropdown, InputGroup, Modal } from "react-bootstrap";
import { isEmail, ReactMultiEmail } from "react-multi-email";
import "react-multi-email/style.css";
import { connect } from "react-redux";
import store from "../../store/store";

const mapStateToProps = state => {
  return {
    team: state.team
  };
};

class ShareCollectionForm extends Component {
  state = {
    data: {
      role: "Collaborator"
    },
    emails: []
  };

  async componentDidMount() {
    this.props.fetchAllUsersOfTeam(this.props.team_id);
    this.flag = 0;
    store.subscribe(() => {
      if (this.flag === 0) {
        this.flag = 1;
        this.props.fetchAllUsersOfTeam(this.props.team_id);
      }
    });
  }

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
    this.flag = 0;
    this.props.shareCollection(teamMemberData);
    this.setState({
      data: {
        role: "Collaborator"
      },
      emails: []
    });
  }

  addMember() {
    let teamMembers = [];
    if (this.state.emails !== undefined) {
      for (let i = 0; i < this.state.emails.length; i++) {
        teamMembers[i] = {
          email: this.state.emails[i],
          role: this.state.data.role,
          teamIdentifier: this.props.team_id
        };
      }
    }

    return teamMembers;
  }

  async doSubmit(e) {
    e.preventDefault();
    const teamMembers = this.addMember();
    this.onShareCollectionSubmit(teamMembers);
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
          <form onSubmit={this.doSubmit.bind(this)}>
            <div className="row">
              <InputGroup>
                <ReactMultiEmail
                  name="email"
                  placeholder="Email-id"
                  emails={emails}
                  onChange={_emails => {
                    this.state.emails = _emails;
                  }}
                  validateEmail={email => {
                    return isEmail(email);
                  }}
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
                      {this.state.data.role}
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
                </InputGroup.Append>
              </InputGroup>
            </div>
            <br />
            <table class="table table-striped">
              <thead class="thead-dark">
                <tr>
                  <th scope="col">S No.</th>
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
            <div style={{ float: "right" }}>Total Members: {count}</div>
            <button className="btn btn-default">Share1</button>
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
