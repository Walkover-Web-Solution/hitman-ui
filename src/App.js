import React, { Component } from "react";
import { Route, Switch } from "react-router-dom";
import Login from "./components/auth/login";
import Logout from "./components/auth/logout";
import collectionsApiService from "./components/collections/collectionsApiService";
import NotFound from "./components/common/notFound";
import ProtectedRoute from "./components/common/protectedRoute";
import Main from "./components/main/Main.jsx";
import PublicView from "./components/main/publicView";
import Public from "./components/publicEndpoint/publicEndpoint.jsx";
import Landing from './components/landing/landing';
import PublishDocs from './components/publishDocs/publishDocs';

class App extends Component {
  async redirectToClientDomain() {
    console.log(window.location.href)
    const domainsList = process.env.REACT_APP_DOMAINS_LIST ? process.env.REACT_APP_DOMAINS_LIST.split(',') : [];
    const currentDomain = window.location.href.split("/")[2];
    console.log(!domainsList.includes(currentDomain))
    if (!domainsList.includes(currentDomain) && window.location.href.split("/")[3] !== "p") {
      const clientCollection = collectionsApiService.getCollectionsByCustomDomain(currentDomain);
      if (clientCollection && clientCollection[0]) {
        const clientCollectionId = clientCollection[0].id;
        this.props.history.push({ pathname: `/p/${clientCollectionId}` });
      }
      else {
        this.props.history.push({ pathname: `/p/error` });
      }
    }
  }

  render() {
    this.redirectToClientDomain();
    return (
      <Switch>
        <Route path="/admin/publish" component={PublishDocs} />
        <Route path="/dashboard/" component={Main} />
        <Route path="/p/error" component={NotFound} />
        <Route path="/p/:collectionIdentifier" component={Public} />
        <Route path="/logout" component={Logout} />
        <Route path="/login" component={Login} />
        <Route path="/marketPlace" component={PublicView} />
        <Route path="/" component={Landing} />
      </Switch>
    );
  }
}

export default App;
