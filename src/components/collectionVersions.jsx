import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Link } from 'react-router-dom';
import NavBar from './navbar';
import collectionversionsservice from '../services/collectionVersionServices';
import CollectionVersionForm from './collectionVersionForm';

class CollectionVersions extends Component {
	state = {
		collectionVersions: [],
		collectionId: '',
		selectedCollectionVersion: {}
	};

	async componentDidMount() {
		collectionversionsservice.setcollectionId(this.state.collectionId);
		const { data: collectionVersions } = await collectionversionsservice.getCollectionVersions();
		this.setState({ collectionVersions });
		this.props.history.replace({ newCollectionVersion: null });
	}

	async handleAdd(newCollectionVersion) {
		if (newCollectionVersion.id) {
			const body = { ...newCollectionVersion };
			delete body.id;
			const index = this.state.collectionVersions.findIndex((cv) => cv.id === newCollectionVersion.id);
			await collectionversionsservice.updateCollectionVersion(newCollectionVersion.id, body);
			const collectionVersions = [ ...this.state.collectionVersions ];
			collectionVersions[index] = body;
			this.setState({ collectionVersions });
		}
		const { data: collectionVersion } = await collectionversionsservice.saveCollectionVersion(newCollectionVersion);
		const collectionVersions = [ ...this.state.collectionVersions, collectionVersion ];
		this.setState({ collectionVersions });
	}

	async handleDelete(collectionVersion) {
		this.props.history.replace({ newCollectionVersion: null });
		const collectionVersions = this.state.collectionVersions.filter((cv) => cv.id !== collectionVersion.id);
		this.setState({ collectionVersions });
		await collectionversionsservice.deleteCollectionVersion(collectionVersion.id);
	}

	handleUpdate(collectionVersion) {
		this.state.selectedCollectionVersion = collectionVersion;
		this.props.history.push(`/collections/${this.state.collectionId}/versions/${collectionVersion.number}/edit`);
	}

	render() {
		this.state.collectionId = this.props.location.pathname.split('/')[2];

		if (this.props.location.newCollectionVersion) {
			const newCollectionVersion = this.props.location.newCollectionVersion;
			this.props.history.replace({ newCollectionVersion: null });
			this.handleAdd(newCollectionVersion);
		}

		console.log(this.state.collectionId);
		return (
			<div>
				<NavBar />
				<h1>Collection Versions</h1>
				<button className="btn btn-success btn-lg">
					<Link to={`/collections/${this.state.collectionId}/versions/new`}>Add Collection Version</Link>
				</button>
				<div className="tabs" />
				<Switch>
					<Route
						path="/collections/:collectionId/versions/new"
						render={(props) => (
							<CollectionVersionForm
								show={true}
								onHide={() => {}}
								title="Add new Collection Version"
								collectionid={this.state.collectionId}
							/>
						)}
					/>
					<Route
						path="/collections/:collectionId/versions/:collectioVersionNumber/edit"
						render={(props) => (
							<CollectionVersionForm
								show={true}
								onHide={() => {}}
								title="Edit Collection Version"
								collectionid={this.state.collectionId}
								selectedcollectionversion={this.state.selectedCollectionVersion}
							/>
						)}
					/>
				</Switch>
				<table className="table">
					<thead>
						<tr>
							<th>Title</th>
							<th>Edit</th>
							<th>Delete</th>
							<th>Group</th>
						</tr>
					</thead>
					<tbody>
						{this.state.collectionVersions.map((collectionVersion) => (
							<tr key={collectionVersion.id}>
								<td>Version-{collectionVersion.number}</td>
								<td>
									<button
										className="btn btn-info btn-sm"
										onClick={() => this.handleUpdate(collectionVersion)}
									>
										Edit
									</button>
								</td>
								<td>
									<button
										className="btn btn-danger btn-sm"
										onClick={() => this.handleDelete(collectionVersion)}
									>
										Delete
									</button>
								</td>
								<td>
									<button className="btn btn-info btn-sm">Group</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}

export default CollectionVersions;
