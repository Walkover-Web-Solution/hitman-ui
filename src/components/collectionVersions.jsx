import React, { Component } from 'react';
import Input from './common/input';
class CollectionVersions extends Component {
	state = {
		account: { no: '', host: '' }
	};

	handleSubmit = (e) => {
		e.preventDefault();

		console.log('submitted');
	};

	handleChange = ({ currentTarget: input }) => {
		const account = { ...this.state.account };
		account[input.name] = input.value;
		this.setState({ account });
	};
	render() {
		const { account } = this.state;
		return (
			<div>
				<h1>Collection Versions </h1>
				<form onSubmit={this.handleSubmit}>
					<Input value={account.no} onChange={this.handleChange} name="no" label="Number" />
					<Input value={account.host} onChange={this.handleChange} name="host" label="Host" />
					<button className="btn btn-primary">Submit</button>
				</form>
			</div>
		);
	}
}

export default CollectionVersions;
