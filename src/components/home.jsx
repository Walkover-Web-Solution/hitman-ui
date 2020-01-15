import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Home extends Component {
  render () {
    const h1style = {
      color: '#0f0f0f',
      fontSize: '50px',
      padding: '30px'
      // backgroundColor: '#ebe9df'
    }

    const pstyle = {
      color: '#0f0f0f',
      fontSize: '30px',
      padding: '10px'
    }

    return (
      <React.Fragment>
        <center>
          <h1 style={h1style}>Welcome To Hitman</h1>

          <br />
          <br />
          <p style={pstyle}>
            An efficient product which can help end users to dry run and manage
            their API documentation conveniently.
          </p>
          <br />

          <p style={pstyle}> To login Click on the below button</p>

          <button className='btn btn-primary btn-lg'>
            <Link to='/login' style={{ color: '#FFF' }}>
              Go To Login
            </Link>
          </button>
        </center>
      </React.Fragment>
    )
  }
}

export default Home
