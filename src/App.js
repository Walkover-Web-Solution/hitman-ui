import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import "./App.css";
import Collections from "./components/collections";
import Home from "./components/home";
import Login from "./components/login";
import Logout from "./components/logout";
import ProtectedRoute from "./components/common/protectedRoute";
import CollectionVersions from "./components/collectionVersions";

class App extends Component {
    render() {
        return ( <
            div >
            <
            div className = "content" >
            <
            Switch >
            <
            ProtectedRoute path = "/collections/:id/versions"
            component = { CollectionVersions }
            />{" "} <
            ProtectedRoute path = "/collections"
            component = { Collections }
            />{" "} <
            Route path = "/login"
            component = { Login }
            />{" "} <
            Route path = "/logout"
            component = { Logout }
            />{" "} <
            Route path = "/"
            component = { Home }
            />{" "} <
            /Switch>{" "} <
            /div>{" "} <
            /div>
        );
    }
}

export default App;