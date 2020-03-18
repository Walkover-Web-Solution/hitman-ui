import React, { Component } from "react";
// import Form from "../common/form";
import { Modal, Dropdown, Button, InputGroup } from "react-bootstrap";
import Joi from "joi-browser";
import { ReactMultiEmail, isEmail } from "react-multi-email";
import "react-multi-email/style.css";

class ShareCollectionForm extends Component {
  state = {
    data: {
      role: null
    },
    errors: {},
    teamMembers: []
  };

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
  validate(teamMembers) {
    // delete teamMembers;
    const errors = Joi.validate(teamMembers, this.schema, {
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
    this.validate(teamMembers);

    console.log(teamMembers);
    this.setState({ teamMembers });
  }

  async doSubmit() {
    this.onShareCollectionSubmit(this.state.teamMembers);
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
                  ref={this.email}
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
            {/* <div>
              {this.state.teamMembers.map(member => (
                <div>{member.email} </div>
              ))}
            </div> */}
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

export default ShareCollectionForm;
