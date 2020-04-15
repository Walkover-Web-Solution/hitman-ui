export function isDashboardRoute(props) {
  if (
    props.location.pathname === "/dashboard" ||
    props.location.pathname.split("/")[1] === "dashboard"
  )
    return true;
  else return false;
}

export default {
  isDashboardRoute,
};
