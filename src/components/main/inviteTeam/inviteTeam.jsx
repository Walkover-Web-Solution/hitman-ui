import React, { useState, useEffect, useRef } from 'react'
import { useHistory } from 'react-router-dom/cjs/react-router-dom.min'
import './inviteTeam.scss'
import { getCurrentOrg } from '../../auth/authServiceV2'
import { toast } from 'react-toastify'
import GenericModal from '../GenericModal'
import { inviteMembers } from '../../../services/orgApiService'
import { useSelector, useDispatch } from 'react-redux'
import { addNewUserData } from '../../auth/redux/userAction'
import { inviteuserMail } from '../../common/apiUtility'

function InviteTeam() {
  const dispatch = useDispatch()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const history = useHistory()
  const inputRef = useRef(null)
  const { users } = useSelector((state) => {
    return { users: state.users }
  })

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
    setEmail('')
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSendInvite(e)
  }

  const handleSendInvite = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (!validateEmail(email)) {
        toast.error('Invalid email format')
        return
      }
      const extractedName = email.substring(0, email.indexOf('@')).replace(/[^a-zA-Z]/g, '');
      const response = await inviteMembers(extractedName, email)
      if (response?.data?.status == 'success') {
        dispatch(addNewUserData(response?.data?.data))
        handleCloseModal()
        await inviteuserMail(email)
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
          email={email}
          validateEmail={validateEmail}
          handleKeyPress={handleKeyPress}
          inputRef={inputRef}
          setEmail={setEmail}
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
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(users).map(([key, user]) => (
              <tr key={key}>
                <td>{user?.email}</td>
                <td>Admin</td> 
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default InviteTeam
