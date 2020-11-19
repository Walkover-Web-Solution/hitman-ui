export function isDashboardRoute(props) {
  if (
    props.location.pathname === "/dashboard" ||
    props.location.pathname.split("/")[1] === "dashboard" || (props.location.pathname.split("/")[1] === "admin" && props.location.pathname.split("/")[2] === "publish")
  )
    return true;
  else return false;
}

export function isSavedEndpoint(props) {
  const pathname = props.location.pathname;
  if (
    pathname === "/dashboard/endpoint/new" ||
    pathname.split("/")[3] === "new"
  )
    return false;
  else return true;
}

export default {
  isDashboardRoute,
  isSavedEndpoint,
};
