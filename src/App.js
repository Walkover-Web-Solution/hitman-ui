import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import './App.css';
import Home from './components/home';
import Login from './components/login';
import Logout from './components/logout';
import ProtectedRoute from './components/common/protectedRoute';
import Main from './components/Main.jsx';
import Public from './public';

class App extends Component {
	render() {
		return (
			<Switch>
				<ProtectedRoute path="/dashboard/" component={Main} />
				<Route path="/login" component={Login} />
				<Route path="/logout" component={Logout} />
				<Route path="/public" component={Public} />
				<Route exact path="/" component={Home} />
			</Switch>
		);
	}
}

export default App;
