import jQuery from "jquery";
import { Component, default as React } from "react";
import { Dropdown, InputGroup, Modal } from "react-bootstrap";
import { isEmail, ReactMultiEmail } from "react-multi-email";
import "react-multi-email/style.css";
import { connect } from "react-redux";
import shortid from "shortid";
import authService from "../auth/authService";

const mapStateToProps = state => {
  return {
    teamUsers: state.teamUsers
  };
};

class ShareCollectionForm extends Component {
  state = {
    data: {
      role: "Collaborator"
    },
    emails: [],
    modifiedteamMembers: []
  };
  changeTeamFlag = true;

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

  setSelectedUserRole(key, teamIdentifier) {
    this.changeTeamFlag = false;
    this.props.teamUsers[teamIdentifier].role = key;
    const currentMember = this.props.teamUsers[teamIdentifier];
    let modifiedteamMembers = this.state.modifiedteamMembers;
    this.modifyMember("updateMember", currentMember);
    this.setState({ modifiedteamMembers });
  }

  async onShareCollectionSubmit(teamMemberData) {
    this.props.shareCollection(teamMemberData);
    this.setState({
      data: {
        role: "Collaborator"
      },
      emails: [],
      modifiedteamMembers: []
    });
  }

  async modifyMember(value, selectedMember) {
    let modifiedteamMembers = this.state.modifiedteamMembers;
    const len = modifiedteamMembers.length;
    if (value === "addMember") {
      if (this.state.emails !== undefined) {
        for (let i = len; i < len + this.state.emails.length; i++) {
          modifiedteamMembers[i] = {
            email: this.state.emails[i - len],
            role: this.state.data.role,
            teamId: this.props.team_id,
            id: null,
            deleteFlag: false,
            userId: null,
            requestId: shortid.generate()
          };
        }
      }
    } else {
      let deleteFlag = "";
      if (value === "deleteMember") {
        deleteFlag = true;
      } else {
        deleteFlag = false;
      }
      modifiedteamMembers[len.toString()] = {
        email: selectedMember.email,
        role: selectedMember.role,
        teamId: this.props.team_id,
        id: this.props.teamUsers[selectedMember.userId].id,
        deleteFlag,
        userId: selectedMember.userId,
        requestId: null
      };
    }
    this.setState({ modifiedteamMembers });
    return modifiedteamMembers;
  }

  async handleSubmit(e) {
    e.preventDefault();
    const modifiedteamMembers = await this.modifyMember("addMember", null);
    this.onShareCollectionSubmit(modifiedteamMembers);
  }

  fetchCurrentUserRole() {
    const { user: currentUser } = authService.getCurrentUser();
    const teamArray = Object.keys(this.props.teamUsers);
    for (let i = 0; i < teamArray.length; i++) {
      if (currentUser.identifier === teamArray[i]) {
        return this.props.teamUsers[currentUser.identifier].role;
      }
    }
  }

  handleDelete(teamMember) {
    const role = this.fetchCurrentUserRole();
    if (role === "Owner" || role === "Admin") {
      if (
        window.confirm("Are you sure you want to remove member from the team?")
      ) {
        this.props.teamUsers[teamMember.userId].deleteFlag = true;
        this.modifyMember("deleteMember", teamMember);
      }
    } else {
      alert("As a collaborator, you are not allowed to remove a team member");
    }
  }

  // fetchTeam() {
  //   if (this.changeTeamFlag === true) {
  //     this.team = jQuery.extend(true, {}, this.props.teamUsers);
  //   }
  // }

  handlePublic(collection) {
    collection.isPublic = !collection.isPublic;
    delete collection.teamId;
    this.props.updateCollection({ ...collection });
  }

  render() {
    //this.fetchTeam();
    this.currentUserRole = this.fetchCurrentUserRole();
    let count = Object.keys(this.props.teamUsers).length;
    let serialNo = 1;
    const { emails } = this.state;

    return (
      <Modal
        {...this.props}
        size="lg"
        animation={false}
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
                  {this.currentUserRole === "Admin" ||
                  this.currentUserRole === "Owner" ? (
                    <div>
                      <button
                        style={{ float: "right", marginLeft: "10px" }}
                        type="button"
                        class="btn btn-success"
                        onClick={() => {
                          this.handlePublic(
                            this.props.collections[this.props.collection_id]
                          );
                        }}
                      >
                        {this.props.collections[this.props.collection_id]
                          .isPublic
                          ? "Make Private"
                          : "Make Public"}
                      </button>
                    </div>
                  ) : null}
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
              {Object.keys(this.props.teamUsers).map(teamId => (
                <tbody>
                  <tr
                    className={
                      this.props.teamUsers[teamId].deleteFlag === true
                        ? "table-dark"
                        : "table-light"
                    }
                  >
                    <th scope="row">{serialNo++}</th>
                    <td>{this.props.teamUsers[teamId].email}</td>
                    <td>
                      {" "}
                      {this.currentUserRole === "Admin" ||
                      this.currentUserRole === "Owner" ? (
                        <Dropdown style={{ paddingLeft: "20px" }}>
                          <Dropdown.Toggle
                            variant="success"
                            id="dropdown-basic disabled"
                          >
                            {this.props.teamUsers[teamId].role}
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            {Object.keys(this.dropdownRole).map(key => (
                              <Dropdown.Item
                                className={
                                  this.props.teamUsers[teamId].role === "Owner"
                                    ? "disabled"
                                    : null
                                }
                                onClick={() =>
                                  this.setSelectedUserRole(
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
                        this.props.teamUsers[teamId].role
                      )}
                    </td>
                    {this.props.teamUsers[teamId].role === "Owner" ||
                    this.props.teamUsers[teamId].userId ===
                      authService.getCurrentUser().user.identifier ? (
                      <td></td>
                    ) : (
                      <td>
                        <button
                          type="button"
                          className="btn btn-default"
                          onClick={() => {
                            this.handleDelete(this.props.teamUsers[teamId]);
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
                  type="button"
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
