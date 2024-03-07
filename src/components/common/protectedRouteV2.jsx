import React from 'react'
import { Route, Navigate } from 'react-router-dom'
import { getCurrentUser, getCurrentOrg, getOrgList, getProxyToken } from '../auth/authServiceV2'
import { useLocation } from 'react-router'

const ProtectedRouteV2 = ({ path, component: Component, render, ...rest }) => {
  const location = useLocation()
  const match = location.pathname.split('/')
  const isOrgInPath = match.includes('orgs') ? true : false

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!getProxyToken()) {
          return (
            <Navigate
              to={{
                pathname: '/logout',
                search: `?redirect_uri=${props.location.pathname}`
              }}
            />
          )
        } else if (getCurrentUser() && getOrgList() && getCurrentOrg()) {
          const currentOrgId = getCurrentOrg().id
          if (isOrgInPath && match[2] !== currentOrgId.toString()) {
            let newUrl
            if (props?.location?.pathname.split('/')[1] === 'orgs') {
              newUrl = props?.location?.pathname.replace(/\/orgs\/[^\/]+/, `/orgs/${currentOrgId}/`)
            }
            return (
              <Redirect
                to={{
                  pathname: newUrl
                }}
              />
            )
          }
          return Component ? <Component {...props} /> : render(props)
        } else {
          return (
            <Navigate
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
