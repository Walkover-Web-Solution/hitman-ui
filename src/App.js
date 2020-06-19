import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./components/auth/login";
import Logout from "./components/auth/logout";
import ProtectedRoute from "./components/common/protectedRoute";
import Main from "./components/main/Main.jsx";
import Public from "./components/publicEndpoint/publicEndpoint.jsx";
import herokuApiService from "./services/herokuApiService";
import store from "./store/store";
import PublicView from "./components/main/publicView";
import NotFound from "./components/common/notFound";

class App extends Component {
  async redirectToClientDomain() {
    const { data: configVars } = await herokuApiService.getConfigVars();
    if (
      window.location.href.split("/")[3] !== "p" &&
      window.location.href.split("/")[2] !== "hitman-ui.herokuapp.com" &&
      window.location.href.split("/")[2] !== "localhost:3000"
    ) {
      if (configVars && configVars[window.location.href.split("/")[2]]) {
        const url = window.location.href.split("/");
        const baseUrl = url[2];

        const clientDetails = configVars[baseUrl].split(",");
        const clientTitle = clientDetails[0];
        const clientDomain = url[2];
        const clientCollectionId = clientDetails[2];

        this.props.history.push({ pathname: `/p/${clientCollectionId}` });
      }
    }
  }

  render() {
    this.redirectToClientDomain();
    return (
      <Switch>
        <ProtectedRoute path="/dashboard/" component={Main} />
        <Route path="/p/error" component={NotFound} />
        <Route path="/p/:collectionIdentifier" component={Public} />
        <Route path="/logout" component={Logout} />
        <Route path="/login" component={Login} />
        <Route path="/" component={PublicView} />
      </Switch>
    );
  }
}

export default App;
