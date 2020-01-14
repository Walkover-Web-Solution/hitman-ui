import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import Home from "./components/home";
import Login from "./components/login";
import Collections from "./components/Collections/collection";
import addCollection from "./components/Collections/addCollection";

class App extends Component {
  render() {
    return (
      <div>
        <div className="content">
          <Switch>
            <Route path="/collections/add" component={addCollection} />
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
