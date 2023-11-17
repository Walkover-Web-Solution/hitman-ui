import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getCurrentOrg, getProxyToken } from '../../auth/authServiceV2';
import './inviteTeam.scss';
import { useHistory } from 'react-router-dom'

function InviteTeam() {
  const [users, setUsers] = useState([]);
  const history = useHistory()

  useEffect(() => {
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

    fetchUsers();
  }, []);

  const handleBack = () => {
    const orgId = getCurrentOrg()?.id
    history.push(`/orgs/${orgId}/dashboard/endpoint/new`);
  };

  return (
    <>
      <nav className={'navbar'}>
        <button className={'backButton'} onClick={handleBack}>Dashboard</button>
        <h1 className={'title'}>Manage Team</h1>
      </nav>
      <div className={'container'}>
        <button className={'inviteButton'} onClick={() => {/* logic to invite members */ }}>
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
    </>
  );
}

export default InviteTeam;
