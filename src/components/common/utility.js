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

export function setTitle (title) {
  if (typeof title === 'string') {
    if (title.trim().length > 0) {
      document.title = title.trim() + ' ' + 'API Documentation'
    }
  }
}

export function setFavicon (link) {
  if (typeof link === 'string') {
    if (link.trim().length > 0) { document.getElementById('favicon').href = link.trim() }
  }
}

export default {
  isDashboardRoute,
  isSavedEndpoint,
  setTitle,
  setFavicon
}
