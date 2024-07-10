let navigate

export const setNavigate = (nav) => {
  navigate = nav
}

export const navigateTo = (path, state) => {
  if (navigate) {
    navigate(path, { state })
  } else {
    console.error('Navigate function is not set')
  }
}
