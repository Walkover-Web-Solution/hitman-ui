import queryString from "query-string";
import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import auth from "../services/authService";

class Login extends Component {
  async componentDidMount() {
    const socketJwt = this.getSocketJwt();
    if (!socketJwt) return;
    await auth.login(socketJwt);
    const { state } = this.props.location;
    window.location = state ? state.from.pathname : "/collections";
  }

  getSocketJwt = () => {
    const { location } = this.props;
    const { "sokt-auth-token": socketJwt } = queryString.parse(location.search);
    return socketJwt;
  };

  render() {
    if (auth.getCurrentUser()) return <Redirect to="/collections" />;
    const redirectionUrl = "http://localhost:3000/login";
    const socketLoginUrl = `https://viasocket.com/login?token_required=true&redirect_uri=${redirectionUrl}`;

    return (
      <React.Fragment>
        <h1>Login</h1>

        <button className="btn btn-success btn-lg">
          <a href={socketLoginUrl}>Login With ViaSocket</a>
        </button>
      </React.Fragment>
    );
  }
}

export default Login;
