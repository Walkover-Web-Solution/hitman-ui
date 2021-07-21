const BOARD_TOKEN = '488357946'
const FEEDIO_WIDGET_URL = 'https://wgt.feedio.ai'

export function loadfeedioWidget () {
  let user = window.localStorage.getItem('profile')
  try {
    user = JSON.parse(user)
  } catch {
    user = null
  }
  if (user && !document.getElementById('feedio-wgt-script')) {
    const script = document.createElement('script')
    script.src = FEEDIO_WIDGET_URL
    script.id = 'feedio-wgt-script'
    script.type = 'text/javascript'
    script.setAttribute('board-token', BOARD_TOKEN)
    script.setAttribute('email', user.email)
    script.setAttribute('debug', true)
    document.body.appendChild(script)
    script.onload = () => {
    }
  }
}
