import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./components/auth/login";
import Logout from "./components/auth/logout";
import ProtectedRoute from "./components/common/protectedRoute";
import Main from "./components/main/Main.jsx";
import Public from "./components/publicEndpoint/publicEndpoint.jsx";
import { Redirect } from "react-router-dom";
import herokuApiService from "./services/herokuApiService";
require("dotenv").config();
class App extends Component {
  async redirectToClientDomain() {
    const { data: configVars } = await herokuApiService.getConfigVars();
    console.log(configVars);
    if (
      window.location.href.split("/")[2] !== "hitman-ui.herokuapp.com" ||
      window.location.href.split("/")[2] !== "localhost:3000"
    ) {
      if (configVars && configVars[window.location.href.split("/")[2]]) {
        const baseUrl = window.location.href.split("/")[2];
        const clientDetails = configVars[baseUrl].split(",");
        const clientTitle = clientDetails[0];
        const clientDomain = window.location.href.split("/")[2];
        const clientCollectionId = clientDetails[1];
        return <Redirect to={`/public/${clientCollectionId}`} />;
      }
    }
  }

  render() {
    console.log(window.location.href.split("/")[2]);
    this.redirectToClientDomain();
    return (
      <Switch>
        <ProtectedRoute path="/dashboard/" component={Main} />
        <Route path="/public/:collectionIdentifier" component={Public} />
        <Route path="/logout" component={Logout} />
        <Route path="/" component={Login} />
      </Switch>
    );
  }
}

export default App;
