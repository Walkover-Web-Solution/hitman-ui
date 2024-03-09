const widgetURL = process.env.NEXT_PUBLIC_STEVE_WIDGET_URL
const projectId = process.env.NEXT_PUBLIC_STEVE_PROJECT_ID
const authkey = process.env.NEXT_PUBLIC_STEVE_AUTHKEY
const widgetId = process.env.NEXT_PUBLIC_STEVE_WIDGET_ID
const FIRST_JULY_2021 = new Date('2021-07-01').valueOf()

export function moveToNextStep(currentStepNo) {
  try {
    if (window.isUserOnboardingComplete && window.isUserOnboardingComplete() === false) {
      const steveEvent = new window.CustomEvent('steveOnboarding', { detail: { doneStep: currentStepNo } })
      window.dispatchEvent(steveEvent)
    }
  } catch (error) {
    console.error(error)
  }
}

export function onOnboardingCompleted() {
  const steveEvent = new window.CustomEvent('steveOnboarding', { detail: { isOnboardingComplete: true } })
  window.dispatchEvent(steveEvent)
}

function getUserName(profile) {
  const firstName = profile?.first_name || ''
  const lastName = profile?.last_name || ''
  const name = firstName + ' ' + lastName
  return name?.trim()
}

export function loadWidget() {
  let user = window.localStorage.getItem('profile')
  user = JSON.parse(user)
  const userCreatedAt = new Date(user?.created_at)?.valueOf()
  const identifier = user.identifier
  const onboardingWgt = document.getElementById('onboarding-wgt-script')
  let userData = {}
  try {
    const userName = getUserName(user)
    userData = {
      name: userName,
      email: user.email,
      userId: identifier,
      isOnboardingComplete: userCreatedAt < FIRST_JULY_2021
    }
  } catch {}
  if (!onboardingWgt && identifier) {
    const script = document.createElement('script')
    script.src = widgetURL
    script.id = 'onboarding-wgt-script'
    script.type = 'text/javascript'
    script.setAttribute('project-id', projectId)
    script.setAttribute('authkey', authkey)
    script.setAttribute('widget-id', widgetId)
    script.setAttribute('user-data', JSON.stringify(userData))
    document.body.appendChild(script)
    script.onload = () => {}
  }
}

export default {
  moveToNextStep,
  onOnboardingCompleted,
  loadWidget
}
