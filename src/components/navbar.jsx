import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import CollectionVersions from './collectionVersions'
const NavBar = () => {
  return (
    <nav className='navbar navbar-expand-lg navbar-light bg-light'>
      <Link className='navbar-brand' to='#'>
        HITMAN
      </Link>

      <div className='collapse navbar-collapse' id='navbarNav'>
        <NavLink className='nav-link nav-item' to='/login'>
          Logout
        </NavLink>
        <NavLink className='nav-link nav-item' to='/collectionVersions'>
          CollectionVersions
        </NavLink>
      </div>
    </nav>
  )
}

export default NavBar
