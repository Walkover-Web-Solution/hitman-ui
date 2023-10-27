import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import { getCurrentUser, getCurrentOrg, getOrgList, getJwt } from '../auth/authServiceV2'

const ProtectedRouteV2 = ({ path, component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!getJwt()) {
          return (
            <Redirect
              to={{
                pathname: '/logout',
                search: `?redirect_uri=${props.location.pathname}`
              }}
            />
          )
        } else if (getCurrentUser() && getOrgList() && getCurrentOrg()) {
          return Component ? <Component {...props} /> : render(props)
        } else {
          return (
            <Redirect
              to={{
                pathname: '/login',
                search: `?redirect_uri=${props.location.pathname}`
              }}
            />
          )
        }
      }}
    />
  )
}

export default ProtectedRouteV2
