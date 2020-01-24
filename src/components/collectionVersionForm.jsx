//Routing is not done properly

import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { Modal } from 'react-bootstrap';
import Form from './common/form';
import Joi from 'joi-browser';
import collectionversionsservice from '../services/collectionVersionServices';

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
		console.log('ho');
		this.state.editCollectionVersion = true;
		if (this.props.title === 'Edit Collection Version') {
			this.state.data.id = this.props.selectedcollectionversion.id;
			this.setState({ redirect: true });
			console.log('ho2');
		}
		if (this.props.title === 'Add new Collection Version') {
			console.log('ho1');
			//
			console.log(this.props.selectedcollection);
			console.log(this.props.selectedcollection.identifier);
			collectionversionsservice.setcollectionId(this.props.selectedcollection.identifier);
			console.log(this.props.selectedcollection.identifier, this.state.data);
			await collectionversionsservice.saveCollectionVersion(this.state.data);
			this.setState({ redirect: true });
		}
	}

	render() {
		console.log(this.props);
		if (this.props.location) {
			console.log(this.props.location.state.selectedCollectionVersion);
		}
		if (this.props.selectedcollectionversion && this.state.editCollectionVersion) {
			this.state.editCollectionVersion = false;
			this.state.data.number = this.props.selectedcollectionversion.number;
			this.state.data.host = this.props.selectedcollectionversion.host;
		} else this.state.editCollectionVersion = false;
		if (this.state.redirect) {
			return (
				<Redirect
					to={{
						pathname: `/collections`,
						newCollectionVersion: { ...this.state.data },
						collectionId: this.props.collectionid
					}}
				/>
			);
		}
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
