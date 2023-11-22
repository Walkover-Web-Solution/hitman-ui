import React, {useState, useEffect } from 'react'
import { useLocation, useHistory } from 'react-router-dom'
import Cookies from 'universal-cookie'
import { Modal } from 'react-bootstrap'
import { getOrgList } from './authService'
import './login.scss'
const tokenKey = 'token'
export const orgKey = 'organisation'
export const orgListKey = 'organisationList'
const organizations = JSON.parse(window.localStorage.getItem('organisationList')) || []
// console.log(organizations, "organisationList");


class OrgModal extends React.Component {
    
    constructor(props) {
        console.log("came here")
      super(props);
      this.state = {
        showOrgModal: true,
        orgList: [],
        data:{},
      };
    }
  
    handleOrgSelection = (orgId) => {
      const reloadRoute = `/orgs/${orgId}/dashboard`;
      this.props.history.push(reloadRoute);
      this.switchOrg(orgId);
    };
  
    async switchOrg(orgId) {
      console.log("inside switch org");
      try {
        const proxyUrl = process.env.REACT_APP_PROXY_URL;
        const response = await fetch(proxyUrl + '/switchCompany', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            proxy_auth_token: this.getProxyToken()
          },
          body: JSON.stringify({
            company_ref_id: orgId
          })
        });
  
        if (response.ok && response.status === 200) {
          const reloadRoute = `/orgs/${orgId}/dashboard`;
          // const org=window.localStorage.getItem('organisation')
          // window.localStorage.setItem('organisation', JSON.stringify(org.id))
        } else {
          console.error('Error switching organization:', response.message);
        }
      } catch (error) {
        console.error('Error while calling switchCompany API:', error);
      }
    }
  
    getProxyToken() {
      const cookies = new Cookies();
      const token = cookies.get('token');
      return token || window.localStorage.getItem('token');
    }
  
    componentDidMount() {
        console.log("comopin handle org selection");
    this.state.data = getOrgList();
      console.log(this.state.data, "in handle org selection");
    }

    x = () => {
        const data = getOrgList();
        console.log("printdata == ",data);
        return (
        <Modal show={this.state.showOrgModal} 
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
            <Modal.Body style={{ height: '20vh', overflowY: 'auto' }}>
              {data.map(org => (
                <button className='btn btn-secondary' key={org.id} onClick={() => {
                  this.handleOrgSelection(org.id);
                }}>
                  {org.name}
                </button>
              ))}
            </Modal.Body>
          </Modal>
        )
    }
  
    render() {
      return (
        <>
        {this.x()}
        </>
      );
    }
  }
  
  export default OrgModal;
// export {isAdmin, getCurrentUser, getCurrentOrg, getOrgList, getProxyToken, logout }
