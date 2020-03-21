import { Component, default as React } from "react";
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
    emails: [],
    teamMembers: []
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

  setDropdowmRole(key) {
    const data = this.state.data;
    data.role = this.dropdownRole[key].name;
    this.setState({
      data
    });
  }

  setCurrentUserRole(key, teamIdentifier) {
    this.team[teamIdentifier].role = key;
    const currentMember = this.team[teamIdentifier];
    let teamMembers = this.state.teamMembers;
    const len = teamMembers.length;
    teamMembers[len.toString()] = {
      email: currentMember.email,
      role: currentMember.role,
      teamIdentifier: this.props.team_id,
      id: this.props.team[currentMember.userId].id,
      deleteFlag: false
    };
    this.setState({ teamMembers });
  }

  async onShareCollectionSubmit(teamMemberData) {
    this.flag = 0;
    this.props.shareCollection(teamMemberData);
    this.setState({
      data: {
        role: "Collaborator"
      },
      emails: [],
      teamMembers: []
    });
  }

  async addMember() {
    let teamMembers = this.state.teamMembers;
    const len = teamMembers.length;
    if (this.state.emails !== undefined) {
      for (let i = len; i < len + this.state.emails.length; i++) {
        teamMembers[i] = {
          email: this.state.emails[i - len],
          role: this.state.data.role,
          teamIdentifier: this.props.team_id,
          id: null,
          deleteFlag: false
        };
      }
    }
    this.setState({ teamMembers });
    return teamMembers;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const teamMembers = await this.addMember();
    this.onShareCollectionSubmit(teamMembers);
  }

  fetchCurrentUserRole() {
    const { user: currentUser } = authService.getCurrentUser();
    const teamArray = Object.keys(this.props.team);
    for (let i = 0; i < teamArray.length; i++) {
      if (currentUser.identifier === teamArray[i]) {
        return this.props.team[currentUser.identifier].role;
      }
    }
  }

  handleDelete(teamId, teamMember) {
    const role = this.fetchCurrentUserRole();
    if (role === "Owner" || role === "Admin") {
      if (
        window.confirm("Are you sure you want to remove member from the team?")
      ) {
        this.team[teamMember.userId].deleteFlag = true;
        let teamMembers = this.state.teamMembers;
        const len = teamMembers.length;
        teamMembers[len.toString()] = {
          email: teamMember.email,
          role: teamMember.role,
          teamIdentifier: this.props.team_id,
          id: this.props.team[teamMember.userId].id,
          deleteFlag: true
        };
        this.setState({ teamMembers });
      }
    } else {
      alert("As a collaborator, you are not allowed to remove a team member");
    }
  }

  render() {
    this.team = this.props.team;
    this.currentUserRole = this.fetchCurrentUserRole();
    let count = Object.keys(this.team).length;
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
          <form onSubmit={this.handleSubmit.bind(this)}>
            <div className="row">
              {this.currentUserRole === "Admin" ||
              this.currentUserRole === "Owner" ? (
                <InputGroup style={{ padding: "20px", flexWrap: "nowrap" }}>
                  <ReactMultiEmail
                    style={{ flex: "1" }}
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
                            onClick={() => this.setDropdowmRole(key)}
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
              {Object.keys(this.team).map(teamId => (
                <tbody>
                  <tr
                    className={
                      this.team[teamId].deleteFlag === true
                        ? "table-dark"
                        : "table-light"
                    }
                  >
                    <th scope="row">{serialNo++}</th>
                    <td>{this.team[teamId].email}</td>
                    <td>
                      {" "}
                      {this.currentUserRole === "Admin" ||
                      this.currentUserRole === "Owner" ? (
                        <Dropdown style={{ paddingLeft: "20px" }}>
                          <Dropdown.Toggle
                            variant="success"
                            id="dropdown-basic"
                          >
                            {this.team[teamId].role}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {Object.keys(this.dropdownRole).map(key => (
                              <Dropdown.Item
                                onClick={() =>
                                  this.setCurrentUserRole(
                                    this.dropdownRole[key].name,
                                    teamId
                                  )
                                }
                              >
                                {this.dropdownRole[key].name}
                              </Dropdown.Item>
                            ))}
                          </Dropdown.Menu>
                        </Dropdown>
                      ) : (
                        this.team[teamId].role
                      )}
                    </td>
                    {this.team[teamId].role === "Owner" ||
                    this.team[teamId].userId ===
                      authService.getCurrentUser().user.identifier ? (
                      <td></td>
                    ) : (
                      <td>
                        <button
                          type="button"
                          className="btn btn-default"
                          onClick={() => {
                            this.handleDelete(
                              this.props.team_id,
                              this.team[teamId]
                            );
                          }}
                        >
                          X
                        </button>
                      </td>
                    )}
                  </tr>
                </tbody>
              ))}
            </table>
            <div style={{ float: "right" }}>Total Members: {count}</div>
            {this.currentUserRole === "Admin" ||
            this.currentUserRole === "Owner" ? (
              <div>
                <button className="btn btn-default">Apply</button>
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
