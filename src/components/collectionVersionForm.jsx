//Routing is not done properly

import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import Form from './common/form';
import Joi from 'joi-browser';

class CollectionVersionForm extends Form {
	state = {
		data: {
			name: '',
			website: '',
			description: '',
			keyword: ''
		},
		errors: {},
		redirect: false,
		editCollectionVersion: true
	};

	schema = {
		name: Joi.string().required().label('Username'),
		website: Joi.string().required().label('Website'),
		keyword: Joi.string().required().label('Keywords'),
		description: Joi.string().allow(null, '').label('Description')
	};

	async doSubmit(props) {
		this.state.editCollectionVersion = true;
		if (this.props.title == 'Edit CollectionVersion') {
			this.state.data.identifier = this.props.posts.identifier;
			this.setState({ redirect: true });
		}
		if (this.props.title == 'Add new CollectionVersion') {
			this.setState({ redirect: true });
		}
	}

	render() {
		if (this.state.redirect) {
			return (
				<Redirect
					to={{
						pathname: '/collections/:id/collectionVersions',
						newCollectionVersion: { ...this.state.data }
					}}
				/>
			);
		}
		if (this.props.posts && this.state.editCollectionVersion) {
			this.state.editCollectionVersion = false;
			this.state.data.name = this.props.posts.name;
			this.state.data.website = this.props.posts.website;
			this.state.data.description = this.props.posts.description;
			this.state.data.keyword = this.props.posts.keyword;
		} else this.state.editCollectionVersion = null;
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
						<Link to="/collections/:id/collectionVersions">Cancel</Link>
					</form>
				</Modal.Body>
			</Modal>
		);
	}
}

export default CollectionVersionForm;
