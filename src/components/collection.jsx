import React from 'react'
import queryString from 'query-string'
import NavBar from './navbar'

const Collectionts = ({ match, location }) => {
  const result = queryString.parse(location.search)
  console.log(result)
  return (
    <div>
      <NavBar />

      <h1>Collections</h1>
    </div>
  )
}

export default Collectionts
