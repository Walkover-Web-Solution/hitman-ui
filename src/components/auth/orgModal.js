import React from "react";
import Cookies from "universal-cookie";
import { Modal } from "react-bootstrap";
import { getOrgList } from "./authService";
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

  async switchOrg(orgId) {
    try {
      const proxyUrl = process.env.REACT_APP_PROXY_URL;
      const response = await fetch(proxyUrl + "/switchCompany", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          proxy_auth_token: this.getProxyToken(),
        },
        body: JSON.stringify({
          company_ref_id: orgId,
        }),
      });

      if (response.ok && response.status === 200) {
        this.handleOrgSelection(orgId)
      } else {
        console.error("Error switching organization:", response.message);
      }
    } catch (error) {
      console.error("Error while calling switchCompany API:", error);
    }
  }

  getProxyToken() {
    const cookies = new Cookies();
    const token = cookies.get("token");
    return token || window.localStorage.getItem("token");
  }

  componentDidMount() {
    this.state.data = getOrgList();
  }

  x = () => {
    const data = getOrgList();
    return (
      <Modal
        show={this.state.showOrgModal}
        onHide={() => this.setState({ showOrgModal: false })}
        centered
        aria-labelledby="contained-modal-title-vcenter"
        size="lg"
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header closeButton>
          <Modal.Title>Select Organization</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "20vh", overflowY: "auto" }}>
          {data.map((org) => (
            <button
              className="btn btn-secondary"
              key={org.id}
              onClick={() => {
                this.switchOrg(org.id);
              }}
            >
              {org.name}
            </button>
          ))}
        </Modal.Body>
      </Modal>
    );
  };

  render() {
    return <>{this.x()}</>;
  }
}

export default OrgModal;
