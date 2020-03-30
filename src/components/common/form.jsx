import React, { Component } from "react";
import Input from "./input";
import Joi from "joi-browser";

class Form extends Component {
  state = {
    data: {},
    errors: {}
  };

  validate = () => {
    const options = { abortEarly: false };
    const { error } = Joi.validate(this.state.data, this.schema, options);
    if (!error) return null;
    const errors = {};
    for (let item of error.details) errors[item.path[0]] = item.message;
    return errors;
  };

  handleSubmit = e => {
    e.preventDefault();
    const errors = this.validate();
    this.setState({ errors: errors || {} });
    if (errors) return;
    this.doSubmit();
  };

  handleChange = e => {
    const data = { ...this.state.data };
    data[e.currentTarget.name] = e.currentTarget.value;
    this.setState({ data });
  };

  renderInput(name, label, placeholder) {
    const { data, errors } = this.state;
    return (
      <Input
        name={name}
        label={label}
        value={data[name]}
        onChange={this.handleChange}
        error={errors[name]}
        placeholder={placeholder}
      />
    );
  }

  renderTextArea(name, label, placeholder) {
    const { data, errors } = this.state;
    return (
      <div className="form-group ">
        <label for={name} className="custom-input-label">
          {label}
        </label>
        <textarea
          className="form-control custom-input"
          rows="10"
          onChange={this.handleChange}
          id={name}
          error={errors[name]}
          name={name}
          value={data[name]}
          placeholder={placeholder}
        ></textarea>
      </div>
    );
  }

  renderButton(label, style) {
    return (
      <button
        className="btn btn-default custom-button"
        style={{ float: style, borderRadius: "12px" }}
      >
        {label}
      </button>
    );
  }
}

export default Form;
