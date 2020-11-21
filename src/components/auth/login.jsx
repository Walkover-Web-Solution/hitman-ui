import queryString from "query-string";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "./auth.scss";
import auth from "./authService";


class Login extends Component {
  async componentDidMount() {
    const socketJwt = this.getSocketJwt();
    if (!socketJwt) return;
    const userInfo = await auth.login(socketJwt);
    console.log(userInfo)
    const { state } = this.props.location;
    const orgIdentifier = userInfo.orgs[0].identifier
    window.location = state ? state.from.pathname : `/org/${orgIdentifier}/dashboard`;
  }

  getSocketJwt = () => {
    const { location } = this.props;
    const { "sokt-auth-token": socketJwt } = queryString.parse(location.search);
    return socketJwt;
  };

  render() {
    if (auth.getCurrentUser()) {
      const orgIdentifier = auth.getCurrentOrg().identifier
      return <Redirect to={`/org/${orgIdentifier}/dashboard`} />;}

    return <React.Fragment></React.Fragment>;
  }
}

export default Login;
