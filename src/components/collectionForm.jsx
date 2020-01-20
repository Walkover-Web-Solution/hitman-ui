import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import Form from './common/form';
import Joi from 'joi-browser';

class CollectionForm extends Form {
	state = {
		data: {
			name: '',
			website: '',
			description: '',
			keyword: ''
		},
		errors: {},
		submittedNewCollection: false
	};

	schema = {
		name: Joi.string().required().label('Username'),
		website: Joi.string().required().label('Website'),
		keyword: Joi.string().required().label('Keywords'),
		description: Joi.string().allow(null, '').label('Description')
	};

	async doSubmit(props) {
		this.setState({ submittedNewCollection: true });
	}

	render() {
		if (this.state.submittedNewCollection) {
			return (
				<Redirect
					to={{
						pathname: '/collections',
						newCollection: { ...this.state.data }
					}}
				/>
			);
		}
		return (
			<Modal {...this.props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
				<Modal.Header>
					<Modal.Title id="contained-modal-title-vcenter">Add new Collection</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form onSubmit={this.handleSubmit}>
						{this.renderInput('name', 'Name*')}
						{this.renderInput('website', 'Website*')}
						{this.renderInput('keyword', 'Keywords*')}
						{this.renderInput('description', 'Description')}
						{this.renderButton('Submit')}
						<button className="btn btn-default">
							<Link to="/collections">Cancel</Link>
						</button>
					</form>
				</Modal.Body>
			</Modal>
		);
	}
}

export default CollectionForm;
