import React from "react";
import { switchOrg } from "../../services/orgApiService";
import { Modal} from "react-bootstrap";
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
          {/* dropdown removed */}
          <div className="org-listing-container ">
            <div className="org-listing-column d-flex flex-column">
              {data.map((org, key) => (
                <button
                  className='btn btn-primary mb-2 p-2'
                  key={key}
                  onClick={() => switchOrg(org.id)}
                >
                  {org.name}
                </button>
              ))}
            </div>
          </div>
        </Modal.Body>
        <Modal.Body>
          <p className="font-italic" style={{ fontSize: "18px" }}>
            Select any organization to proceed further
          </p>
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    return <>{this.SelectOrg()}</>;
  }
}

export default OrgModal;
