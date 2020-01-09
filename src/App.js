import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import Collections from "./components/collection";
import Home from "./components/home";
import Login from "./components/login";

class App extends Component {
  render() {
    return (
      <div>
        <div className="content">
          <Switch>
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
