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
		redirect: false,
		editCollection: true
	};

	schema = {
		name: Joi.string().required().label('Username'),
		website: Joi.string().required().label('Website'),
		keyword: Joi.string().required().label('Keywords'),
		description: Joi.string().allow(null, '').label('Description')
	};

	async doSubmit(props) {
		this.state.editCollection = true;
		if (this.props.title === 'Edit Collection') {
			this.state.data.identifier = this.props.selectedcollection.identifier;
			this.setState({ redirect: true });
		}
		if (this.props.title === 'Add new Collection') {
			this.setState({ redirect: true });
		}
	}

	render() {
		if (this.state.redirect) {
			return (
				<Redirect
					to={{
						pathname: '/collections',
						newCollection: { ...this.state.data }
					}}
				/>
			);
		}
		if (this.props.selectedcollection && this.state.editCollection) {
			this.state.editCollection = false;
			this.state.data.name = this.props.selectedcollection.name;
			this.state.data.website = this.props.selectedcollection.website;
			this.state.data.description = this.props.selectedcollection.description;
			this.state.data.keyword = this.props.selectedcollection.keyword;
		} else this.state.editCollection = null;
		return (
			<Modal {...this.props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
				<Modal.Header>
					<Modal.Title id="contained-modal-title-vcenter">{this.props.title}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form onSubmit={this.handleSubmit}>
						{this.renderInput('name', 'Name*')}
						{this.renderInput('website', 'Website*')}
						{this.renderInput('keyword', 'Keywords*')}
						{this.renderInput('description', 'Description')}
						{this.renderButton('Submit')}
						<Link to="/collections">Cancel</Link>
					</form>
				</Modal.Body>
			</Modal>
		);
	}
}

export default CollectionForm;
