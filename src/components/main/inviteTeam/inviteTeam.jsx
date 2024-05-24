import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import axios from 'axios'
import './inviteTeam.scss'
import { getCurrentOrg, getProxyToken } from '../../auth/authServiceV2'
import { toast } from 'react-toastify'
import GenericModal from '../GenericModal'
import { inviteMembers } from '../../../services/orgApiService'
import { useSelector } from 'react-redux'

function InviteTeam() {
  const [users, setUsers] = useState([])
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const history = useHistory()
  const inputRef = useRef(null)
  const [loadingUsers, setLoadingUsers] = useState(true);

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await axios.get('https://routes.msg91.com/api/c/getUsers?itemsPerPage=100', {
        headers: { proxy_auth_token: getProxyToken() }
      })
      setUsers(response?.data?.data?.data)
    } catch (error) {
      toast.error('Error fetching users: ' + error.message)
    }finally {
      setLoadingUsers(false);
    }
  }

  useEffect(() => {
    if (showModal) {
      inputRef.current.focus()
    }
  }, [showModal])

  const handleBack = () => {
    const orgId = getCurrentOrg()?.id
      history.push(`/orgs/${orgId}/dashboard`)
  }

  const handleInviteClick = () => setShowModal(true)
  const handleCloseModal = () => {
    setShowModal(false)
    setName('')
    setEmail('')
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendInvite(e)
    }
  }

  const handleSendInvite = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (!validateEmail(email)) {
        toast.error('Invalid email format')
        return
      }
      const response = await inviteMembers(name, email)
      if (response.status === 'success') {
        setUsers((prevUsers) => [{ name, email }, ...prevUsers])
        handleCloseModal()
      }
      else{
        handleCloseModal()
      }
    } catch (error) {
      toast.error('Cannot proceed at the moment. Please try again later')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <nav className='navbar'>
        <button className='backButton' onClick={handleBack}>
          Dashboard
        </button>
        <h1 className='title'>Manage Team</h1>
      </nav>
      <div className='container'>
        <button className='btn btn-primary btn-sm fs-4 inviteButton' onClick={handleInviteClick}>
          + Add Member
        </button>
        <GenericModal
          name={name}
          email={email}
          validateEmail={validateEmail}
          handleKeyPress={handleKeyPress}
          inputRef={inputRef}
          setEmail={setEmail}
          setName={setName}
          handleSendInvite={handleSendInvite}
          handleCloseModal={handleCloseModal}
          showModal={showModal}
          onHide={handleCloseModal}
          title='Add Member'
          showInputGroup
          loading={loading}
        />
        <table className='table'>
          <thead>
            <tr>
              {/* <th>Name</th> */}
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          {loadingUsers ? (
            <>
            <div className="team">
              <div className="d-flex align-items-center justify-content-between">
                <div className="email bg"></div>
                <div className="admin bg"></div>
                <div className="edit bg"></div>
              </div>
            </div>
             <div className="team my-3">
             <div className="d-flex align-items-center justify-content-between">
               <div className="email bg"></div>
               <div className="admin bg"></div>
               <div className="edit bg"></div>
             </div>
           </div>
           <div className="team">
             <div className="d-flex align-items-center justify-content-between">
               <div className="email bg"></div>
               <div className="admin bg"></div>
               <div className="edit bg"></div>
             </div>
           </div>
           <div className="team my-3">
             <div className="d-flex align-items-center justify-content-between">
               <div className="email bg"></div>
               <div className="admin bg"></div>
               <div className="edit bg"></div>
             </div>
           </div>
           </>
          ) : (
            <tbody>
              {users.map((user) => (
                <tr key={user.email}>
                  {/* <td>{user.name}</td> */}
                  <td>{user.email}</td>
                  <td>Admin</td>
                  <td>
                    {/* <button
                      className='editButton'
                      onClick={() => {
                        
                      }}
                    >
                      Edit
                    </button> */}
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
    </>
  )
}

export default InviteTeam
