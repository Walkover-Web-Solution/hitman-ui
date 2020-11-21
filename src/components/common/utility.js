import authService from "../auth/authService";

export function isDashboardRoute(props) {
  if (
    props.location.pathname === `/org/${authService.getCurrentOrg().identifier}/dashboard` ||
    props.location.pathname.split("/")[3] === "dashboard"
  )
    return true;
  else return false;
}

export function isSavedEndpoint(props) {
  const pathname = props.location.pathname;
  if (
    pathname === `/org/${authService.getCurrentOrg().identifier}/dashboard/endpoint/new` ||
    pathname.split("/")[5] === "new"
  )
    return false;
  else return true;
}

export default {
  isDashboardRoute,
  isSavedEndpoint,
};
