const widgetURL = process.env.REACT_APP_STEVE_API_URL
const projectId = process.env.REACT_APP_STEVE_PROJECT_ID
const authkey = process.env.REACT_APP_STEVE_AUTHKEY
const widgetId = process.env.REACT_APP_STEVE_WIDGET_ID

export function moveToNextStep () {
  const steveEvent = new window.CustomEvent('steveOnboarding', { detail: { moveTo: 'next' } })
  window.dispatchEvent(steveEvent)
}

export function onOnboardingCompleted () {
  const steveEvent = new window.CustomEvent('steveOnboarding', { detail: { isOnboardingComplete: true } })
  window.dispatchEvent(steveEvent)
}

export function loadWidget () {
  const user = window.localStorage.getItem('profile')
  const email = JSON.parse(user).email
  const script = document.createElement('script')
  script.src = widgetURL
  script.id = 'onboarding-wgt-script'
  script.type = 'text/javascript'
  script.setAttribute('project-id', projectId)
  script.setAttribute('user-id', email)
  script.setAttribute('authkey', authkey)
  script.setAttribute('widget-id', widgetId)
  document.body.appendChild(script)
  script.onload = () => {
  }
}

export default {
  moveToNextStep,
  onOnboardingCompleted,
  loadWidget
}
