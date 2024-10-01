import React, { useState, useEffect } from 'react'
import { getCurrentUser } from '../auth/authServiceV2'
import Link from 'next/link'

function UserInfo(props) {
  const [user, setUser] = useState({ name: '', email: '' })

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      currentUser.name = currentUser.first_name + currentUser.last_name
      setUser(currentUser)
    }
  }, [])

  return (
    <div className='btn-grp' id='user-menu'>
      <div className='dropdown user-dropdown'>
        <button
          className='user-dropdown-btn'
          type='button'
          id='dropdownMenuButton'
          data-toggle='dropdown'
          aria-haspopup='true'
          aria-expanded='false'
        >
          <div className='user-info'>
            <div className='user-avatar'>
              <i className='uil uil-user' />
            </div>
            <div className='user-details'>
              <div className='user-details-heading'>
                <div className='user-name'>{user.name}</div>
              </div>
            </div>
          </div>
        </button>
        <div className='dropdown-menu' aria-labelledby='dropdownMenuButton'>
          <div className='user-info'>
            <div className='user-avatar'>
              <i className='uil uil-user' />
            </div>
            <div className='user-details'>
              <div className='user-details-heading'>
                <div className='user-name'>{user.name}</div>
              </div>
              <div className='user-details-text'>{user.email}</div>
            </div>
          </div>
          <li>
            <Link href='/logout'>Sign out</Link>
          </li>
          {getCurrentUser() === null ? null : (
            <li>
              <Link href='/dashboard'>My Collections</Link>
            </li>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserInfo