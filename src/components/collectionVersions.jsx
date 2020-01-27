import React, { Component } from 'react';
import collectionversionsservice from '../services/collectionVersionServices';
import { Accordion, Card, Button, Dropdown, DropdownButton } from 'react-bootstrap';

class CollectionVersions extends Component {
	state = {};

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
		// const collectionVersions = this.props.collections.collectionVersions.filter(
		// 	(cv) => cv.id !== collectionVersion.id
		// );
		// collectionversionsservice.setcollectionId(this.props.collections.identifier);
		// await collectionversionsservice.deleteCollectionVersion(collectionVersion.id);
		// this.props.history.push({
		// 	pathname: '/collections',
		// 	state: { deletedCollectionVersionid: collectionVersion.id, collectionId: this.props.collections.identifier }
		// });
	}

	handleUpdate(collectionVersion) {
		// this.state.selectedCollectionVersion = collectionVersion;
		this.props.history.push({
			pathname: `/collections/${this.props.collections.identifier}/versions/${collectionVersion.number}/edit`,
			state: { selectedCollectionVersion: collectionVersion, collectionId: this.props.collections.identifier }
		});
	}

	render() {
		return (
			<div>
				{this.props.collections.collectionVersions &&
					this.props.collections.collectionVersions.map((collectionVersion, index) => (
						<Accordion defaultActiveKey="0" key={index}>
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
										<Dropdown.Item
											eventKey="1"
											onClick={() => this.handleUpdate(collectionVersion)}
										>
											Edit
										</Dropdown.Item>
										<Dropdown.Item
											eventKey="2"
											onClick={() => this.handleDelete(collectionVersion)}
										>
											Delete
										</Dropdown.Item>
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
