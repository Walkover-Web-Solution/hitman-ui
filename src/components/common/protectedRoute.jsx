import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import auth from '../auth/authService'

const ProtectedRoute = ({ path, component: Component, render, ...rest }) => {
  return (
    <Route
      {...rest}
      render={(props) => {
        if (!auth.getProxyToken()) {
          return (
            <Redirect
              to={{
                pathname: '/logout',
                search: `?redirect_uri=${props.location.pathname}`
              }}
            />
          )
        } else if (auth.getCurrentUser() && auth.getOrgList() && auth.getCurrentOrg()) {
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

export default ProtectedRoute
