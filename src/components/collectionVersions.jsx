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
		const { data: collectionVersions } = await collectionversionsservice.getCollectionVersions(
			this.state.collectionId
		);
		this.setState({ collectionVersions });
		this.props.history.replace({ newCollectionVersion: null });
	}

	async handleAdd(newCollectionVersion) {
		if (newCollectionVersion.collectionId) {
			const body = { ...newCollectionVersion };
			console.log(body);
			delete body.collectionId;
			const index = this.state.collectionVersions.findIndex(
				(cv) => cv.collectionId === newCollectionVersion.collectionId
			);
			await collectionversionsservice.updateCollectionVersion(this.state.collectionId, body);
			const collectionVersions = [ ...this.state.collectionVersions ];
			collectionVersions[index] = body;
			this.setState({ collectionVersions });
		}
		console.log(newCollectionVersion);
		const { data: collectionVersion } = await collectionversionsservice.saveCollectionVersion(
			this.state.collectionId,
			newCollectionVersion
		);
		const collectionVersions = [ ...this.state.collectionVersions, collectionVersion ];
		this.setState({ collectionVersions });
	}

	async handleDelete(collectionVersion) {
		this.props.history.replace({ newCollectionVersion: null });
		const collectionVersions = this.state.collectionVersions.filter((cv) => cv.number !== collectionVersion.number);
		this.setState({ collectionVersions });
		await collectionversionsservice.deleteCollectionVersion(this.state.collectionId, collectionVersion.number);
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
							<tr key={collectionVersion.number}>
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
