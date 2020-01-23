import React from 'react'
import { Link, NavLink } from 'react-router-dom'
const NavBar = () => {
  return (
    <nav className='navbar navbar-light bg-light' style={{ padding: '0' }}>
      <Link className='navbar-brand' to='#'>
        HITMAN
      </Link>

      <NavLink
        style={{ float: 'right', padding: '20px', fontSize: '20px' }}
        to='/logout'
      >
        Logout
      </NavLink>
    </nav>
  )
}

export default NavBar
