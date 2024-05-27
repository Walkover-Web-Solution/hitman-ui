const widgetToken = process.env.REACT_APP_HELLO_WIDGET_TOKEN

function getUserName(profile) {
  const firstName = profile?.first_name || ""
  const lastName = profile?.last_name || ""
  const name = firstName + " " + lastName
  return name?.trim()
}

export function loadHelloWidget() {
  let user = window.localStorage.getItem("profile")
  try {
    user = JSON.parse(user)
  } catch {
    user = null
  }
  const identifier = user?.identifier
  const name = getUserName(user)
  if (user && identifier && !document.getElementById("hello-wgt-script")) {
    const script = document.createElement("script")
    script.id = "hello-wgt-script"
    script.type = "text/javascript"
    script.innerHTML = `
      var helloConfig = {
        widgetToken: "${widgetToken}",
        unique_id: "${identifier}",
        name: "${name}",  
        mail: "${user.email}"
      };
      initChatWidget(helloConfig);
      `
    document.body.appendChild(script)
    script.onload = () => {}
  }
}

export default {
  loadHelloWidget
}
