import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./components/auth/login";
import Logout from "./components/auth/logout";
import ProtectedRoute from "./components/common/protectedRoute";
import Main from "./components/Main.jsx";
import Public from "./components/publicEndpoint/publicEndpoint.jsx";

class App extends Component {
  render() {
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
