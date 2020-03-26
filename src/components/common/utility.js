import React from "react";

export function isDashboardRoute(route) {
  if (route === "/dashboard") return true;
  else return false;
}

export default {
  isDashboardRoute
};
