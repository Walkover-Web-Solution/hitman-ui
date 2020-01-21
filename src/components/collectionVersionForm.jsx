//Routing is not done properly

import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import Form from './common/form';
import Joi from 'joi-browser';

class CollectionVersionForm extends Form {
	state = {
		data: {
			number: '',
			host: ''
		},
		errors: {},
		redirect: false,
		editCollectionVersion: true
	};

	schema = {
		number: Joi.string().required().label('Version number'),
		host: Joi.string().required().label('Host')
	};

	async doSubmit(props) {
		this.state.editCollectionVersion = true;
		if (this.props.title === 'Edit Collection Version') {
			this.state.data.collectionId = this.props.selectedcollectionversion.collectionId;
			this.setState({ redirect: true });
		}
		if (this.props.title === 'Add new Collection Version') {
			this.setState({ redirect: true });
		}
	}

	render() {
		if (this.state.redirect) {
			return (
				<Redirect
					to={{
						pathname: `/collections/${this.props.collectionid}/versions`,
						newCollectionVersion: { ...this.state.data }
					}}
				/>
			);
		}
		if (this.props.selectedcollectionversion && this.state.editCollectionVersion) {
			this.state.editCollectionVersion = false;
			this.state.data.number = this.props.selectedcollectionversion.number;
			this.state.data.host = this.props.selectedcollectionversion.host;
		} else this.state.editCollectionVersion = false;
		return (
			<Modal {...this.props} size="lg" aria-labelledby="contained-modal-title-vcenter" centered>
				<Modal.Header>
					<Modal.Title id="contained-modal-title-vcenter">{this.props.title}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<form onSubmit={this.handleSubmit}>
						{this.renderInput('number', 'Version Number')}
						{this.renderInput('host', 'Host*')}
						{this.renderButton('Submit')}
						<Link to={`/collections/${this.props.collectionid}/versions`}>Cancel</Link>
					</form>
				</Modal.Body>
			</Modal>
		);
	}
}

export default CollectionVersionForm;
