import React from "react";
import {switchOrg} from '../../services/orgApiService'
import { Modal,Dropdown} from "react-bootstrap";
import { getOrgList } from "./authServiceV2";
import "./login.scss";

class OrgModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showOrgModal: true,
      orgList: [],
      data: {},
    };
  }

  handleOrgSelection = (orgId) => {
    const reloadRoute = `/orgs/${orgId}/dashboard`;
    this.props.history.push(reloadRoute);
  };

  

  componentDidMount() {
    this.state.data = getOrgList();
  }

  SelectOrg = () => {
    const data = getOrgList();
    return (
      <Modal
        show={this.state.showOrgModal}
        onHide={() => this.setState({ showOrgModal: false })}
        centered
        aria-labelledby="contained-modal-title-vcenter"
        size="sm"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header>
          <Modal.Title>Select Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Dropdown>
            <Dropdown.Toggle id="dropdown-basic">
              Organizations
            </Dropdown.Toggle>
            <Dropdown.Menu>
              {data.map((org) => (
                <React.Fragment key={org.id}>
                  <Dropdown.Item onClick={() => switchOrg(org.id)}>
                    {org.name}
                  </Dropdown.Item>
                </React.Fragment>
              ))}
            </Dropdown.Menu>
          </Dropdown>
        </Modal.Body>
        <Modal.Body>
          <p>Select an organization to proceed further</p>
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    return <>{this.SelectOrg()}</>;
  }
}

export default OrgModal;
