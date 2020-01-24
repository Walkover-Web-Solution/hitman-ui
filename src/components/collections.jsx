import React, { Component } from 'react';
import NavBar from './navbar';
import { Link } from 'react-router-dom';
import { Accordion, Card, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import { Route, Switch } from 'react-router-dom';
import CollectionForm from './collectionForm';
import collectionsservice from '../services/collectionsService';
import collectionversionsservice from '../services/collectionVersionServices';
import CollectionVersions from './collectionVersions';

class Collections extends Component {
	state = {
		collections: [],
		selectedcollection: {}
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
		this.props.history.replace({ newCollection: null });
	}

	async handleAdd(newCollection) {
		if (newCollection.identifier) {
			const body = { ...newCollection };
			delete body.identifier;
			const index = this.state.collections.findIndex(
				(collection) => collection.identifier === newCollection.identifier
			);
			await collectionsservice.updateCollection(newCollection.identifier, body);
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

	render() {
		if (this.props.location.newCollection) {
			const newCollection = this.props.location.newCollection;
			this.props.history.replace({ newCollection: null });
			this.handleAdd(newCollection);
		}
		return (
			<div>
				<div className="App-Nav">
					<NavBar />
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
				</div>
				<div className="App-Side" style={{ backgroundImage: 'linear-gradient(to right, white, skyblue)' }}>
					<button className="btn btn-default btn-lg">
						<Link to="/collections/new">+ New Collection</Link>
					</button>
					<div
						style={{
							listStyleType: 'none',
							paddingLeft: '0px',
							paddingRight: '0px',
							border: '3px solid #d7e9d2',
							margin: '0px 0px 0px 0px'
						}}
					>
						{this.state.collections.map((collection, index) => (
							<div key={index}>
								<Accordion>
									<Card>
										<Card.Header>
											<Accordion.Toggle as={Button} variant="link" eventKey={index}>
												{collection.name}
											</Accordion.Toggle>
											<DropdownButton
												alignRight
												title=""
												id="dropdown-menu-align-right"
												style={{ float: 'right' }}
											>
												<Dropdown.Item
													eventKey="1"
													onClick={() => this.handleUpdate(collection)}
												>
													Edit
												</Dropdown.Item>
												<Dropdown.Item
													eventKey="2"
													onClick={() => this.handleDelete(collection)}
												>
													Delete
												</Dropdown.Item>
											</DropdownButton>
										</Card.Header>
										<Accordion.Collapse eventKey={index}>
											<Card.Body>
												<CollectionVersions collections={this.state.collections[index]} />
											</Card.Body>
										</Accordion.Collapse>
									</Card>
								</Accordion>
							</div>
						))}
					</div>
				</div>
				<div className="App-Main">
					<h1>Main</h1>
				</div>
			</div>
		);
	}
}
export default Collections;
