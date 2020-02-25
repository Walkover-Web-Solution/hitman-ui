import React, { Component } from 'react';
import { Accordion, Card, Button, Dropdown, DropdownButton, Table } from 'react-bootstrap';

class Endpoints extends Component {
	state = {};

	onDragStart = (e, eId) => {
		this.props.group_dnd(false);
		this.draggedItem = eId;
		this.props.set_dnd(eId, this.props.group_id);
	};

	onDragOver = (e, eId) => {
		e.preventDefault();
		this.draggedOverItem = eId;
	};

	async onDragEnd(e, props) {
		this.props.group_dnd(true);
		if (this.draggedItem === this.draggedOverItem) {
			this.draggedItem = null;
			return;
		}
		let endpointIds = this.props.endpoints_order.filter((item) => item !== this.draggedItem);
		const index = this.props.endpoints_order.findIndex((eId) => eId === this.draggedOverItem);
		endpointIds.splice(index, 0, this.draggedItem);
		this.props.set_endpoint_id(this.props.group_id, endpointIds);
		this.draggedItem = null;
	}

	onDrop = (e, eId) => {
		e.preventDefault();
		if (!this.draggedItem) {
			this.props.get_dnd(eId, this.props.group_id);
		}
		// this.draggedItem = null
	};

	handleDelete(endpoint) {
		this.props.history.push({
			pathname: '/dashboard/collections',
			deleteEndpointId: endpoint.id,
			groupId: this.props.group_id
		});
	}

	handleDuplicate(endpoint) {
		this.props.history.push({
			pathname: '/dashboard/collections',
			duplicateEndpoint: endpoint
		});
	}

	handleUpdate(endpoint) {
		this.props.history.push({
			pathname: `/dashboard/collections/${this.props.collection_id}/versions/${this.props
				.version_id}/groups/${this.props.group_id}/endpoints/${endpoint.id}/edit`,
			editEndpoint: endpoint
		});
	}
	handleDisplay(endpoint, groups, versions, groupId) {
		this.props.history.push({
			pathname: `/dashboard/collections/endpoints/${endpoint.id}`,
			title: 'update endpoint',
			endpoint: endpoint,
			groupId: groupId,
			groups: groups,
			versions: versions,
			endpointFlag: true
		});
	}
	render() {
		if (this.props.endpoints_order.length == 0) {
			return (
				// <Accordion
				//   draggable
				// onDragOver={e => this.onDragOver(e)}
				// onDragStart={e => this.onDragStart(e)}
				// onDragEnd={e => this.onDragEnd(e, this.props)}
				// onDrop={e => { console.log("this.onDrop(e, this.props)") }}>
				// <Card>
				//     <Accordion.Toggle as={text}>
				//       This group is empty
				//   </Accordion.Toggle>
				//   </Card>
				// </Accordion>
				<Table
					striped
					bordered
					hover
					size="sm"
					onDragOver={(e) => this.onDragOver(e)}
					onDragStart={(e) => this.onDragStart(e)}
					onDragEnd={(e) => this.onDragEnd(e, this.props)}
					onDrop={(e) => {
						console.log('dropped on empty group');
					}}
				>
					<thead>
						<tr>
							<th>This group is empty</th>
						</tr>
					</thead>
				</Table>
			);
		} else {
			return (
				<div>
					{this.props.endpoints &&
						this.props.endpoints_order
							.filter((eId) => this.props.endpoints[eId].groupId === this.props.group_id)
							.map((endpointId) => (
								<Accordion defaultActiveKey="1" key={endpointId}>
									<Card>
										<Card.Header
											draggable
											onDragOver={(e) => this.onDragOver(e, endpointId)}
											onDragStart={(e) => this.onDragStart(e, endpointId)}
											onDragEnd={(e) => this.onDragEnd(e, endpointId, this.props)}
											onDrop={(e) => this.onDrop(e, endpointId, this.props)}
										>
											<Accordion.Toggle
												onClick={() =>
													this.handleDisplay(
														this.props.endpoints[endpointId],
														this.props.groups,
														this.props.versions,
														this.props.group_id
													)}
												as={Button}
												variant="link"
												eventKey="1"
											>
												{this.props.endpoints[endpointId].name}
											</Accordion.Toggle>
											<DropdownButton
												alignRight
												title=""
												id="dropdown-menu-align-right"
												style={{ float: 'right' }}
											>
												<Dropdown.Item
													eventKey="2"
													onClick={() => this.handleDelete(this.props.endpoints[endpointId])}
												>
													Delete
												</Dropdown.Item>
												<Dropdown.Item
													eventKey="3"
													onClick={() =>
														this.handleDuplicate(this.props.endpoints[endpointId])}
												>
													Duplicate
												</Dropdown.Item>
											</DropdownButton>
										</Card.Header>
									</Card>
								</Accordion>
							))}
				</div>
			);
		}
	}
}

export default Endpoints;
