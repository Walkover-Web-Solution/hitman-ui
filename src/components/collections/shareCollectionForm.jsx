import Joi from "joi-browser";
import { Component, default as React } from "react";
// import Form from "../common/form";
import {
  Button,
  Dropdown,
  InputGroup,
  ListGroup,
  Modal
} from "react-bootstrap";
import { isEmail, ReactMultiEmail } from "react-multi-email";
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
      role: "Collaborator"
    }
  };

  async componentDidMount() {
    this.props.fetchAllUsersOfTeam(this.props.team_id);
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
    this.props.onHide();
    this.props.shareCollection(teamMemberData);
    this.setState({
      data: {
        role: "Collaborator"
      }
    });
  }

  addMember() {
    let teamMembers = {};
    for (let i = 0; i < this.emails.length; i++) {
      teamMembers[i] = {
        email: this.emails[i],
        role: this.state.data.role,
        teamIdentifier: this.props.team_id
      };
    }
    console.log(teamMembers);
    this.setState({ teamMembers });
  }

  async doSubmit() {
    this.addMember();
    this.onShareCollectionSubmit(this.state.teamMembers);
  }

  handleDelete(teamId, email) {
    this.props.deleteUserFromTeam({ teamIdentifier: teamId, email });
  }

  render() {
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
