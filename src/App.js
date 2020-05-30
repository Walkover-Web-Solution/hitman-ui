import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./components/auth/login";
import Logout from "./components/auth/logout";
import ProtectedRoute from "./components/common/protectedRoute";
import Main from "./components/main/Main.jsx";
import Public from "./components/publicEndpoint/publicEndpoint.jsx";
import herokuApiService from "./services/herokuApiService";
import store from "./store/store";
class App extends Component {
  async redirectToClientDomain() {
    const { data: configVars } = await herokuApiService.getConfigVars();
    // console.log("1", configVars);
    if (
      window.location.href.split("/")[3] !== "public" &&
      window.location.href.split("/")[2] !== "hitman-ui.herokuapp.com" &&
      window.location.href.split("/")[2] !== "localhost:3000"
    ) {
      // console.log(
      //   "2",
      //   window.location.href.split("/")[2],
      //   configVars[window.location.href.split("/")[2]]
      // );
      if (configVars && configVars[window.location.href.split("/")[2]]) {
        // console.log("3");
        const url = window.location.href.split("/");
        const baseUrl = url[2];

        const clientDetails = configVars[baseUrl].split(",");
        // console.log(clientDetails);
        const clientTitle = clientDetails[0];
        const clientDomain = url[2];
        const clientCollectionId = clientDetails[2];
        // console.log("3", clientCollectionId);

        this.props.history.push({ pathname: `/public/${clientCollectionId}` });
      }
    }
  }

  render() {
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
