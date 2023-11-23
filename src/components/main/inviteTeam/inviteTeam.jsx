import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentOrg, getProxyToken } from '../../auth/authServiceV2';
import './inviteTeam.scss';
import { useHistory } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { inviteMember } from '../../../services/chatbotService';
import { getCurrentUser } from '../../auth/authServiceV2';
import { toast } from 'react-toastify'
function InviteTeam() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const history = useHistory()
  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://routes.msg91.com/api/c/getUsers', {
        headers: { 'proxy_auth_token': getProxyToken() }
      });
      setUsers(response?.data?.data?.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, [users]);

  const handleBack = () => {
    const orgId = getCurrentOrg()?.id
    history.push(`/orgs/${orgId}/dashboard/endpoint/new`);
  };
  const handleInviteClick = () => {
    setShowModal(true);
  };
  const handleCloseModal = () => {
    setShowModal(false); 
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSendInvite = (e)=>{
    if (!validateEmail(email)) {
      toast.error('Invalid email format');
      return;
    }
    const name = getCurrentUser()?.name
    try{
      inviteMember(name, email)
      toast.success('Invite send Successfully')
      handleCloseModal();
      setEmail('');
      // history.replace(history.location.pathname);
    }
    catch(error){
      console.log("Error in send Invite", error);
      toast.error('Cannot proceed at the moment please try again later')
    }
    e.preventDefault();
  }
  return (
    <>
      <nav className={'navbar'}>
        <button className={'backButton'} onClick={handleBack}>Dashboard</button>
        <h1 className={'title'}>Manage Team</h1>
      </nav>
      <div className={'container'}>
        <button className={'inviteButton'} 
        onClick={handleInviteClick}>
          + Invite Members
        </button>
        <table className={'table'}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Access</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{'Admin'}</td>
                <td>
                  <button className={'editButton'} onClick={() => {/* logic to edit user */ }}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
        <Modal show={showModal} onHide={handleCloseModal}
        aria-labelledby="contained-modal-title-vcenter">
        <Modal.Header closeButton>
          <Modal.Title>Invite Members</Modal.Title>
        </Modal.Header>
        <Modal.Body>
        <InputGroup className="mb-3">
        <Form.Control
          placeholder="Enter User Email"
          type='email'
          aria-label="Recipient's email"
          aria-describedby="basic-addon2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          isInvalid={email && !validateEmail(email)}
        />
      </InputGroup>
    <button className='btn btn-primary' type='submit' onClick={handleSendInvite}>send</button>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default InviteTeam;
