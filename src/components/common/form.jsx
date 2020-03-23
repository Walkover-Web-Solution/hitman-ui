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
    return (
      <div className="form-group ">
        <label for={name} className="custom-input-label">
          {label}
        </label>
        <textarea
          className="form-control custom-input"
          rows="10"
          id={name}
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

  //   renderInputGroup(name, label, type, role,this.dropdownRole) {
  //     const { data, errors } = this.state;
  //     return (
  //       <InputGroup>
  //         <Input
  //           name={name}
  //           label={label}
  //           value={data[name]}
  //           onChange={this.handleChange}
  //           error={errors[name]}
  //           type={type || "text"}
  //         />
  //         <InputGroup.Append>
  //           <Dropdown>
  //             <Dropdown.Toggle variant="success" id="dropdown-basic">
  //               {this.state.data.role ? this.state.data.role : "Role"}
  //             </Dropdown.Toggle>
  //             <Dropdown.Menu>
  //               {Object.keys(this.dropdownRole).map(key => (
  //                 <Dropdown.Item onClick={() => this.setDropdownRole(key)}>
  //                   {this.dropdownRole[key].name}
  //                 </Dropdown.Item>
  //               ))}
  //             </Dropdown.Menu>
  //           </Dropdown>{" "}
  //           {/* <Button variant="outline-secondary">Button</Button> */}
  //           <Button variant="outline-secondary">Button</Button>
  //         </InputGroup.Append>
  //       </InputGroup>
  //     );
  //   }
}

export default Form;
