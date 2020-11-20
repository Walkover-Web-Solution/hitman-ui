import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./components/auth/login";
import Logout from "./components/auth/logout";
import NotFound from "./components/common/notFound";
import ProtectedRoute from "./components/common/protectedRoute";
import Main from "./components/main/Main.jsx";
import PublicView from "./components/main/publicView";
import Public from "./components/publicEndpoint/publicEndpoint.jsx";
require("dotenv").config();

class App extends Component {
  async redirectToClientDomain() {
    // const { data: configVars } = await herokuApiService.getConfigVars();
    console.log(window.location.href)
    const domainsList = process.env.REACT_APP_DOMAINS_LIST?process.env.REACT_APP_DOMAINS_LIST.split(','):[]
    console.log(!domainsList.includes(window.location.href.split("/")[2]))
    if (!domainsList.includes(window.location.href.split("/")[2])&&window.location.href.split("/")[3] !== "p") 
    { 
      let customDomainsList={}
      process.env.REACT_APP_CUSTOM_DOMAINS_LIST.split(';').forEach(s=>{customDomainsList[s.split(',')[0]]=s.split(',')[1]})
      console.log(customDomainsList)
      if (customDomainsList && customDomainsList[window.location.href.split("/")[2]]) {
        const url = window.location.href.split("/");
        const baseUrl = url[2];        
        const clientCollectionId = customDomainsList[baseUrl];
        console.log(clientCollectionId)
        this.props.history.push({ pathname: `/p/${clientCollectionId}` });
      }
      else{
        this.props.history.push({ pathname: `/p/error` });
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
