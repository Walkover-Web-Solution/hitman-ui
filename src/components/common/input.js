import React from "react";

const Input = ({ name, label, value, onChange, error, placeholder }) => {
  return (
    <div className="form-group">
      <label htmlFor={name} className="custom-input-label">
        {label}
      </label>
      <input
        value={value}
        onChange={onChange}
        id={name}
        name={name}
        className="form-control custom-input"
        type="text"
        placeholder={placeholder}
      />
      {error && <div className="alert alert-danger">{error}</div>}
    </div>
  );
};
export default Input;
