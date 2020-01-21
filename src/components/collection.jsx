import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Link } from 'react-router-dom';
import NavBar from './navbar';
import CollectionForm from './collectionForm';
import collectionsservice from '../services/collectionsService';

class Collections extends Component {
	state = {
		collections: [],
		selectedcollection: {}
	};

	async componentDidMount() {
		const { data: collections } = await collectionsservice.getCollections();
		this.setState({ collections });
		this.props.history.replace({ newCollection: null });
	}

	async handleAdd(newCollection) {
		if (newCollection.identifier) {
			const index = this.state.collections.findIndex(
				(collection) => collection.identifier == newCollection.identifier
			);
			await collectionsservice.saveCollection(newCollection);
			this.state.collections[index].name = newCollection.name;
			this.state.collections[index].website = newCollection.website;
			this.state.collections[index].keyword = newCollection.keyword;
			this.state.collections[index].description = newCollection.description;
			const collections = [ ...this.state.collections ];
			this.setState({ collections });
		} else {
			const { data: collection } = await collectionsservice.saveCollection(newCollection);
			const collections = [ ...this.state.collections, collection ];
			this.setState({ collections });
		}
	}

	async handleDelete(collection) {
		this.props.history.replace({ newCollection: null });
		const collections = this.state.collections.filter((c) => c.identifier !== collection.identifier);
		this.setState({ collections });
		await collectionsservice.deleteCollection(collection.identifier);
	}

	handleUpdate(collection) {
		this.state.selectedcollection = collection;
		this.props.history.push(`/collections/${collection.name}/edit`);
	}

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
				<button className="btn btn-success btn-lg">
					<Link to="/collections/new">Add Collection</Link>
				</button>
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
									selectedcollection={this.state.selectedcollection}
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
							<th>Versions</th>
						</tr>
					</thead>
					<tbody>
						{this.state.collections.map((collection) => (
							<tr key={collection.identifier}>
								<td>{collection.name}</td>
								<td>
									<button
										className="btn btn-info btn-sm"
										onClick={() => this.handleUpdate(collection)}
									>
										Edit
									</button>
								</td>
								<td>
									<button
										className="btn btn-danger btn-sm"
										onClick={() => this.handleDelete(collection)}
									>
										Delete
									</button>
								</td>
								<td>
									<button
										className="btn btn-info btn-sm"
										onClick={() =>
											this.props.history.push(`/collections/${collection.identifier}/versions`)}
									>
										Versions
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
