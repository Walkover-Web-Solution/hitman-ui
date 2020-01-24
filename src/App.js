import React, { Component } from 'react';
import { Route, Switch, Link } from 'react-router-dom';
import './App.css';
import Collections from './components/collections';
import SideBar from './components/sidebar';
import Home from './components/home';
import Login from './components/login';
import Logout from './components/logout';
import ProtectedRoute from './components/common/protectedRoute';
import CollectionVersions from './components/collectionVersions';
import Main from './components/Main.jsx';

class App extends Component {
	render() {
		return (
			<Switch>
				<ProtectedRoute path="/collections/" component={Main} />
				<Route path="/login" component={Login} />
				<Route path="/logout" component={Logout} />
				<Route exact path="/" component={Home} />
			</Switch>
		);
	}
}

export default App;
