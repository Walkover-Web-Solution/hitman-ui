import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Home extends Component {
  //   state = {
  //   	url: 'https://viasocket.com/login?token_required=true&redirect_uri=http://localhost:3000'
  //   };
  render () {
    return (
      <div>
        <h1>Welcome To Hitman</h1>
        <button className='btn btn-success btn-lg'>
          <Link to='/login'>Go To Login</Link>
        </button>
      </div>
    )
  }
}

export default Home
