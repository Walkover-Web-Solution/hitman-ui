import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, Card, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom';
import CollectionForm from './collectionForm';
import collectionsservice from '../services/collectionsService';
import collectionversionsservice from '../services/collectionVersionServices';
import CollectionVersions from './collectionVersions';
import CollectionVersionForm from './collectionVersionForm';
import collectionVersionServices from '../services/collectionVersionServices';

class Collections extends Component {
	state = {
		collections: [],
		selectedcollection: {},
		selectedCollectionVersion: {},
		cdmCalled: false
	};

	async fetchVersions(collectionId, index) {
		collectionversionsservice.setcollectionId(collectionId);
		const { data: collectionVersions } = await collectionversionsservice.getCollectionVersions();
		let collections = this.state.collections;
		collections[index].collectionVersions = collectionVersions;
		this.setState({ collections });
	}

	async componentDidMount() {
		const { data: collections } = await collectionsservice.getCollections();
		this.setState({ collections });
		this.state.collections.map((collection, index) => this.fetchVersions(collection.identifier, index));
		this.state.cdmCalled = true;
		this.props.history.replace({ newCollection: null });
	}

	async handleAdd(newCollection) {
		if (newCollection.identifier) {
			const body = { ...newCollection };
			delete body.identifier;
			const index = this.state.collections.findIndex(
				(collection) => collection.identifier === newCollection.identifier
			);
			await collectionsservice.updateCollection(newCollection.identifier, { number: 'v31', host: 'localhost' });
			const collections = [ ...this.state.collections ];
			collections[index] = body;
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

	handleAddVersion(collection) {
		this.state.selectedcollection = collection;
		this.props.history.push(`/collections/${collection.name}/versions/new`);
	}

	async handleUpdateVersion(newCollectionVersion) {
		console.log(newCollectionVersion);
		console.log(this.props.collectionId);
		collectionVersionServices.setcollectionId(this.props.location.collectionidentifier);
		const body = newCollectionVersion;
		const CollectionVersionId = newCollectionVersion.id;
		delete body.id;
		console.log(CollectionVersionId, body);
		await collectionVersionServices.updateCollectionVersion(CollectionVersionId, body);
	}

	handleDeleteVersion(deletedCollectionVersionid, collectionId) {
		console.log(deletedCollectionVersionid, collectionId);
		var collections = [ ...this.state.collections ];
		// const index = collections.findIndex((collection) => collection.identifier === collectionId);
		// console.log(index);
		// console.log(collections[index].collectionVersions);
		// const collectionVersions = collections[index].collectionVersions;
		// console.log(collectionVersions);
		// const index1 = collectionVersions.findIndex(
		// 	(collectionVersion) => collectionVersion.id === deletedCollectionVersionid
		// );
		// delete collectionVersions[index1];
		// collections[index].collectionVersions = collectionVersions;
		this.setState({ collections });
	}

	render() {
		console.log(this.props);
		if (this.props.location.state && this.props.location.state.deletedCollectionVersionid) {
			const deletedCollectionVersionid = this.props.location.state.deletedCollectionVersionid;
			this.props.history.replace({ state: null });
			const collectionId = this.props.location.state.collectionId;
			this.handleDeleteVersion(deletedCollectionVersionid, collectionId);
		}
		if (this.props.location.newCollection) {
			const newCollection = this.props.location.newCollection;
			this.props.history.replace({ newCollection: null });
			this.handleAdd(newCollection);
		}
		if (this.props.location.newCollectionVersion) {
			const newCollectionVersion = this.props.location.newCollectionVersion;
			this.props.history.replace({ newCollectionVersion: null });
			if (newCollectionVersion.id) {
				this.handleUpdateVersion(newCollectionVersion);
			}
			var collections = [ ...this.state.collections ];
			const index = collections.findIndex(
				(collection) => collection.identifier === this.props.location.collectionidentifier
			);
			const collectionVersions = [ ...collections[index].collectionVersions, newCollectionVersion ];
			collections[index].collectionVersions = collectionVersions;
			this.setState({ collections });
		}

		if (this.props.location.state) {
			this.state.selectedCollectionVersion = this.props.location.state.selectedCollectionVersion;
			this.state.selectedcollection.identifier = this.props.location.state.collectionId;
		}
		return (
			<div>
				<div className="App-Nav">
					<div className="tabs">
						<Switch>
							<Route
								path="/collections/:id/versions/new"
								render={(props) => (
									<CollectionVersionForm
										show={true}
										onHide={() => {}}
										title="Add new Collection Version"
										selectedcollection={this.state.selectedcollection}
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
										collectionidentifier={this.state.selectedcollection.identifier}
										selectedcollectionversion={this.state.selectedCollectionVersion}
									/>
								)}
							/>
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
				</div>
				<div className="App-Side">
					<button className="btn btn-default btn-lg">
						<Link to="/collections/new">+ New Collection</Link>
					</button>
					{this.state.collections.map((collection, index) => (
						<Accordion key={collection.identifier}>
							<Card>
								<Card.Header>
									<Accordion.Toggle as={Button} variant="link" eventKey="1">
										{collection.name}
									</Accordion.Toggle>
									<DropdownButton
										alignRight
										title=""
										id="dropdown-menu-align-right"
										style={{ float: 'right' }}
									>
										<Dropdown.Item eventKey="1" onClick={() => this.handleUpdate(collection)}>
											Edit
										</Dropdown.Item>
										<Dropdown.Item eventKey="2" onClick={() => this.handleDelete(collection)}>
											Delete
										</Dropdown.Item>
										<Dropdown.Item eventKey="3" onClick={() => this.handleAddVersion(collection)}>
											Add Version
										</Dropdown.Item>
									</DropdownButton>
								</Card.Header>
								<Accordion.Collapse eventKey="1">
									<Card.Body>
										<CollectionVersions
											{...this.props}
											collections={this.state.collections[index]}
										/>
									</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					))}
				</div>
			</div>
		);
	}
}
export default Collections;
