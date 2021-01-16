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
      document.title = title.trim() + ' API Documentation'
    } else {
      document.title = 'API Documentation'
    }
  }
}

function imageExists (url, exists) {
  const img = new window.Image()
  img.onload = function () { exists(true) }
  img.onerror = function () { exists(false) }
  img.src = url
}

export function setFavicon (link) {
  if (typeof link === 'string') {
    if (link.trim().length > 0) {
      imageExists(link.trim(), function (exists) {
        if (exists) {
          document.getElementById('favicon').href = link.trim()
        }
      })
    }
  }
}

export function comparePositions (a, b) {
  if (parseInt(a.position) < parseInt(b.position)) return -1
  else if (parseInt(a.position) > parseInt(b.position)) return 1
  else return 0
}

export function getProfileName (currentUser) {
  let name = ''
  if (typeof currentUser.first_name === 'string') {
    name = currentUser.first_name.trim()
  }
  if (typeof currentUser.last_name === 'string') {
    name = name + ' ' + currentUser.last_name.trim()
  }
  name = name.trim()
  if (name) {
    return name
  } else {
    return null
  }
}

export default {
  isDashboardRoute,
  isSavedEndpoint,
  setTitle,
  setFavicon,
  getProfileName
}
