import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Link } from 'react-router-dom';
import NavBar from './navbar';
import CollectionForm from './collectionForm';
import collections from '../services/collectionsService';

class Collections extends Component {
	state = {
		posts: []
	};

	async componentDidMount() {
		const { data: posts } = await collections.getCollections();
		this.setState({ posts });
		this.props.history.replace({ newCollection: null });
	}

	async handleAdd(newCollection) {
		this.setState({ posts });
		const { data: post } = await collections.saveCollection(newCollection);
		const posts = [ post, ...this.state.posts ];
	}

	async handleDelete(post) {
		this.props.history.replace({ newCollection: null });
		const posts = this.state.posts.filter((p) => p.identifier !== post.identifier);
		this.setState({ posts });
		await collections.deleteCollection(post.identifier);
	}

	handleUpdate(post) {}

	render() {
		if (this.props.location.newCollection) {
			const newCollection = this.props.location.newCollection;
			this.props.history.replace({ newCollection: null });
			this.handleAdd(newCollection);
		}

		return (
			<div>
				<NavBar />
				<h1>Collections</h1>
				{
					<button className="btn btn-success btn-lg">
						<Link to="/collections/new">Add Collection</Link>
					</button>
				}
				<div className="tabs">
					<Switch>
						<Route
							path="/collections/new"
							render={(props) => <CollectionForm show={true} onHide={() => {}} />}
						/>
					</Switch>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th>Title</th>
							{/* <th>Edit</th> */}
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{this.state.posts.map((post) => (
							<tr key={post.identifier}>
								<td>{post.name}</td>
								{/* <td>
									<button className="btn btn-info btn-sm" onClick={() => this.handleUpdate(post)}>
										Update
									</button>
								</td> */}
								<td>
									<button className="btn btn-danger btn-sm" onClick={() => this.handleDelete(post)}>
										Delete
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}

export default Collections;
