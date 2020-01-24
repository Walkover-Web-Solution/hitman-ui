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

class App extends Component {
	render() {
		return (
			<div>
				<nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
					<a className="navbar-brand col-sm-3 col-md-2 mr-0" href="#">
						Company name
					</a>
					<input
						className="form-control form-control-dark w-100"
						type="text"
						placeholder="Search"
						aria-label="Search"
					/>
					<ul className="navbar-nav px-3">
						<li className="nav-item text-nowrap">
							<Link to="/logout">Sign out</Link>
						</li>
					</ul>
				</nav>
				<div className="container-fluid">
					<div className="row">
						<SideBar />

						<main role="main" className="main col-md-9 ml-sm-auto col-lg-10 px-4">
							<div className="d-flex justify-content-between flex-wrap flex-md-nowrap align-items-center pt-3 pb-2 mb-3 border-bottom">
								<h1 className="h2">Dashboard</h1>
								<Switch>
									{/* <ProtectedRoute path="/collections/:id/versions" component={CollectionVersions} /> */}
									<Route path="/login" component={Login} />
									<Route path="/logout" component={Logout} />
									<Route exact path="/" component={Home} />
								</Switch>
							</div>
						</main>
					</div>
				</div>
			</div>
		);
	}
}

export default App;
