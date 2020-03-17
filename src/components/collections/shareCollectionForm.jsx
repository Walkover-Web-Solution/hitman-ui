import React from "react";
import Form from "../common/form";
import { Modal, Dropdown } from "react-bootstrap";
import Joi from "joi-browser";

class ShareCollectionForm extends Form {
  state = {
    data: {
      email: ""
    },
    errors: {},
    role: null
  };

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
    console.log(this.props);
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
    console.log("submit");
    const teamMember = {
      email: this.state.data.email,
      role: this.state.role,
      teamId: this.props.team_id
    };
    this.onShareCollectionSubmit(teamMember);

    // body.keyword = body.keyword + "," + body.keyword1 + "," + body.keyword2;
    // delete body.keyword1;
    // delete body.keyword2;
    // if (this.props.title === "Edit Collection") {
    //   this.onEditCollectionSubmit();
    // }
    // if (this.props.title === "Add new Collection") {
    //   this.onAddCollectionSubmit();
    // }
  }
  render() {
    console.log(this.props);

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
            {/* {this.renderDropdown()} */}

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

export default ShareCollectionForm;
