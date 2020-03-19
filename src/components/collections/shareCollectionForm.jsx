import { Component, default as React } from "react";
// import Form from "../common/form";
import { Dropdown, InputGroup, Modal } from "react-bootstrap";
import { isEmail, ReactMultiEmail } from "react-multi-email";
import "react-multi-email/style.css";
import { connect } from "react-redux";
import store from "../../store/store";
import authService from "../auth/authService";
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
    console.log("1");
    e.preventDefault();
    const teamMembers = this.addMember();
    this.onShareCollectionSubmit(teamMembers);
  }

  fetchCurrentUserRole() {
    const { user: currentUser } = authService.getCurrentUser();
    for (let i = 0; i < Object.keys(this.props.team).length; i++) {
      if (currentUser.identifier === Object.keys(this.props.team)[i]) {
        return this.props.team[currentUser.identifier].role;
      }
    }
  }
  handleDelete(teamId, teamMember) {
    const role = this.fetchCurrentUserRole();
    if (role === "Admin") {
      if (
        window.confirm("Are you sure you want to remove member from the team?")
      ) {
        this.props.deleteUserFromTeam({
          teamIdentifier: teamId,
          teamMember
        });
      }
    } else {
      alert("As a collaborator, you are not allowed to remove a team member");
    }
  }

  render() {
    this.currentUserRole = this.fetchCurrentUserRole();
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
              {this.currentUserRole === "Admin" ? (
                <InputGroup style={{ padding: "20px", width: "85%" }}>
                  <ReactMultiEmail
                    name="email"
                    placeholder="Email-id"
                    emails={emails}
                    onChange={_emails => {
                      this.setState({ emails: _emails });
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
                    <Dropdown style={{ paddingLeft: "20px" }}>
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
              ) : null}
            </div>
            <br />
            <table className="table table-striped">
              <thead className="thead-dark">
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
                        this.handleDelete(
                          this.props.team_id,
                          this.props.team[teamId]
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
            {this.currentUserRole === "Admin" ? (
              <div>
                <button className="btn btn-default">Share</button>
                <button
                  className="btn btn-default"
                  onClick={() => this.props.onHide()}
                >
                  Cancel
                </button>
              </div>
            ) : null}
          </form>
        </Modal.Body>
      </Modal>
    );
  }
}

export default connect(mapStateToProps, null)(ShareCollectionForm);
