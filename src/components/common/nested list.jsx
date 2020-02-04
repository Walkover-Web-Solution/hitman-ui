import React, { Component } from 'react';
import { Accordion, Card, Button, Dropdown, DropdownButton } from 'react-bootstrap';
import CollectionVersions from '../collectionVersions';

class NestedList extends Component {
	state = {};
	render() {
		return (
			<div key={this.props.index}>
				<Accordion>
					<Card>
						<Card.Header>
							<Accordion.Toggle as={Button} variant="link" eventKey={this.props.index}>
								{this.props.collection.name}
							</Accordion.Toggle>
							<DropdownButton
								alignRight
								title=""
								id="dropdown-menu-align-right"
								style={{ float: 'right' }}
							>
								<Dropdown.Item
									eventKey="1"
									onClick={() => this.props.handleUpdate('this.props.collection')}
								>
									Edit
								</Dropdown.Item>
								<Dropdown.Item eventKey="2">Delete</Dropdown.Item>
							</DropdownButton>
						</Card.Header>
						<Accordion.Collapse eventKey={this.props.index}>
							<Card.Body>
								{/* <CollectionVersions collections={this.state.collections[index]} /> */}
							</Card.Body>
						</Accordion.Collapse>
					</Card>
				</Accordion>
			</div>
		);
	}
}

export default NestedList;
