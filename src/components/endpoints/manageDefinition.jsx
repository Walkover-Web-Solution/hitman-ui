import React, { Component } from "react";
import { ListGroup, Modal, Button } from "react-bootstrap";
// import environmentsApiService from "./environmentsApiService";
// import "./environments.scss";

class ManageDefintionForm extends Component {
  state = {
    environments: {},
  };

  //   async componentDidMount() {
  //     let environments = {};
  //     if (Object.keys(this.props.environment.environments).length) {
  //       environments = { ...this.props.environment.environments };
  //     } else {
  //       const { data } = await environmentsApiService.getEnvironments();
  //       environments = data;
  //     }
  //     this.setState({ environments });
  //     if (this.props.location.editedEnvironment) {
  //       const {
  //         environmentid: environmentId,
  //         editedEnvironment,
  //       } = this.props.location;
  //       this.props.history.replace({ editedEnvironment: null });
  //       environments = [
  //         ...environments.filter((env) => env.id !== environmentId),
  //         { id: environmentId, ...editedEnvironment },
  //       ];
  //       this.setState({ environments });
  //       await environmentsApiService.updateEnvironment(
  //         environmentId,
  //         editedEnvironment
  //       );
  //     }
  //   }

  //   async handleDelete(environment) {
  //     this.props.deleteEnvironment(environment);
  //   }

  handleEdit(object_definition) {
    this.props.onHide(object_definition);

    console.log(object_definition);
    //   this.props.("Edit Object Definition", object_definitionvironment);
  }

  //   handleCancel(props) {
  //     this.props.onHide();
  //   }

  render() {
    return (
      <Modal
        {...this.props}
        size="lg"
        // style={{ height: "300px" }}
        animation={false}
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="custom-collection-modal-container" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            Object Definitions
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ListGroup>
            {Object.keys(this.props.object_definition).map((obj) => (
              <div>
                <ListGroup.Item
                  style={{ width: "93%", float: "left" }}
                  key={obj}
                  onClick={() => this.handleEdit(obj)}
                >
                  {obj}
                </ListGroup.Item>
                <div className="btn-group">
                  <button
                    className="btn "
                    data-toggle="dropdown"
                    aria-haspopup="true"
                    aria-expanded="false"
                  >
                    <i className="fas fa-ellipsis-h"></i>
                  </button>
                  <div className="dropdown-menu dropdown-menu-right">
                    <button
                      className="btn btn-default"
                      // onClick={() => {
                      //   this.props.onHide();
                      //   this.props.open_delete_environment_modal(
                      //     environmentId
                      //   );
                      // }}
                      onClick={() => {
                        this.props.delete_object_definition(obj);
                      }}
                    >
                      delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </ListGroup>
          <Button
            variant="primary"
            onClick={() => this.props.on_new_definition_added()}
          >
            Add new Definition
          </Button>
          <hr />
          <div>
            <div className="custom-button-wrapper">
              <Button
                variant="primary"
                style={{ float: "right", height: "40px", width: "100px" }}
                onClick={() => console.log("Hello")}
              >
                Save Api
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
      // </div>
    );
  }
}

export default ManageDefintionForm;
