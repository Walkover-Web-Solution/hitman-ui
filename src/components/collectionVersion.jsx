//Proper routing is not done properly

import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Link } from 'react-router-dom';
import NavBar from './navbar';
import CollectionForm from './collectionForm';
import collectionVersions from '../services/collectionVersionService';

class CollectionVersion extends Component {
	state = {
		posts: [],
		selectedpost: {}
	};

	async componentDidMount() {
		const { data: posts } = await collectionsVersions.getCollectionVersions();
		this.setState({ posts });
		this.props.history.replace({ newCollectionVersion: null });
	}

	async handleAdd(newCollectionVersion) {
		if (newCollectionVersion.identifier) {
			const index = this.state.posts.findIndex((post) => post.identifier == newCollectionVersion.identifier);
			await collectionVersions.saveCollectionVersion(newCollectionVersion);
			this.state.posts[index].name = newCollectionVersion.name;
			this.state.posts[index].website = newCollectionVersion.website;
			this.state.posts[index].keyword = newCollectionVersion.keyword;
			this.state.posts[index].description = newCollectionVersion.description;
			const posts = [ ...this.state.posts ];
			this.setState({ posts });
		} else {
			const { data: post } = await collectionsVersions.saveCollectionVersion(newCollectionVersion);
			const posts = [ ...this.state.posts, post ];
			this.setState({ posts });
		}
	}

	async handleDelete(post) {
		this.props.history.replace({ newCollectionVersion: null });
		const posts = this.state.posts.filter((p) => p.identifier !== post.identifier);
		this.setState({ posts });
		await collectionVersions.deleteCollectionVersion(post.identifier);
	}

	handleUpdate(post) {
		this.state.selectedpost = post;
		this.props.history.push(`/collections/${post.name}/edit`);
	}

	render() {
		if (this.props.location.newCollectionVersion) {
			const newCollectionVersion = this.props.location.newCollectionVersion;
			this.props.history.replace({ newCollectionVersion: null });
			this.handleAdd(newCollectionVersion);
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
							render={(props) => (
								<CollectionForm show={true} onHide={() => {}} title="Add new Collection" />
							)}
						/>
						<Route
							path="/collections/:id/edit"
							render={(props) => (
								<CollectionForm
									show={true}
									onHide={() => {}}
									title="Edit Collection"
									posts={this.state.selectedpost}
								/>
							)}
						/>
					</Switch>
				</div>
				<table className="table">
					<thead>
						<tr>
							<th>Title</th>
							<th>Edit</th>
							<th>Delete</th>
						</tr>
					</thead>
					<tbody>
						{this.state.posts.map((post) => (
							<tr key={post.identifier}>
								<td>{post.name}</td>
								<td>
									<button className="btn btn-info btn-sm" onClick={() => this.handleUpdate(post)}>
										Edit
									</button>
								</td>
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

export default CollectionVersion;
