import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import Home from "./components/home";
import Login from "./components/login";
import Collections from "./components/collection";
import newCollection from "./components/newCollection";

class App extends Component {
  render() {
    return (
      <div>
        <div className="content">
          <Switch> {/*if no logged in redirect to login page else */}
            <Route path="/collections/new" component={newCollection} />
            <Route path="/collections" component={Collections} />
            <Route path="/login" component={Login} />
            <Route path="/" component={Home} />
          </Switch>
        </div>
      </div>
    );
  }
}

export default App;
