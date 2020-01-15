import React from 'react';

const Input = ({ no, value, label, onChange }) => {
	return (
		<div className="form-group">
			<label htmlFor={no}>{label}</label>
			<input value={value} onChange={onChange} id={no} name={no} type="text" className="form-control" />
		</div>
	);
};

export default Input;
