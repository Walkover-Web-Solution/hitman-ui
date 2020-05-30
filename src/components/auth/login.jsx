import queryString from "query-string";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "./auth.scss";
import auth from "./authService";

class Login extends Component {
  async componentDidMount() {
    const socketJwt = this.getSocketJwt();
    if (!socketJwt) return;
    await auth.login(socketJwt);
    const { state } = this.props.location;
    window.location = state ? state.from.pathname : "/dashboard/endpoint/new";
  }

  getSocketJwt = () => {
    const { location } = this.props;
    const { "sokt-auth-token": socketJwt } = queryString.parse(location.search);
    return socketJwt;
  };

  render() {
    if (auth.getCurrentUser()) return <Redirect to="/dashboard/endpoint/new" />;
    // const redirectionUrl = `http://localhost:3001/login`;
    const redirectionUrl = `https://hitman-ui.herokuapp.com/login`;
    const socketLoginUrl = `https://viasocket.com/login?token_required=true&redirect_uri=${redirectionUrl}`;
    return (
      <React.Fragment>
        <center>
          <h1 id="custom-login-heading">Welcome to the Hitman</h1>

          <button className="btn btn-primary btn-lg" id="custom-login-button">
            <a href={socketLoginUrl}>Login With ViaSocket</a>
          </button>
        </center>
      </React.Fragment>
    );
  }
}

export default Login;
