export function isDashboardRoute (props, sidebar = false) {
  if (
    props.location.pathname === '/dashboard' ||
    props.location.pathname.split('/')[1] === 'dashboard' || (sidebar === true && props.location.pathname.split('/')[1] === 'admin' && props.location.pathname.split('/')[2] === 'publish')
  ) { return true } else return false
}

export function isSavedEndpoint (props) {
  const pathname = props.location.pathname
  if (
    pathname.split('/')[2] === 'endpoint' &&
    pathname.split('/')[3] !== 'new'
  ) { return true } else return false
}

export default {
  isDashboardRoute,
  isSavedEndpoint
}
