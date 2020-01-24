import React, { Component } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Link } from 'react-router-dom';
import collectionversionsservice from '../services/collectionVersionServices';
import CollectionVersionForm from './collectionVersionForm';
import './collectionStyle.css';
import { Accordion, Card, Button, Dropdown, DropdownButton } from 'react-bootstrap';

class CollectionVersions extends Component {
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
		return (
			<div>
				<link rel="stylesheet" type="text/css" href="collectionStyle.css" />

				{this.props.collections.collectionVersions &&
					this.props.collections.collectionVersions.map((collectionVersion, index1) => (
						<Accordion defaultActiveKey="0" key={'c' + collectionVersion.id}>
							<Card>
								<Card.Header>
									<Accordion.Toggle as={Button} variant="link" eventKey="1">
										{collectionVersion.number}
									</Accordion.Toggle>
									<DropdownButton
										alignRight
										title=""
										id="dropdown-menu-align-right"
										style={{ float: 'right' }}
									>
										<Dropdown.Item eventKey="1">Edit</Dropdown.Item>
										<Dropdown.Item eventKey="2">Delete</Dropdown.Item>
									</DropdownButton>
								</Card.Header>
								<Accordion.Collapse eventKey="1">
									<Card.Body>Groups</Card.Body>
								</Accordion.Collapse>
							</Card>
						</Accordion>
					))}
			</div>
		);
	}
}
export default CollectionVersions;
