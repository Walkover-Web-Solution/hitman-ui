import React, { Component } from 'react';
import Input from "./input";
import Joi from 'joi-browser';

class Form extends Component {

    state={
        data:{},
        errors:{}
    }

    validate = () => {

        const options = { abortEarly: false };
        const {error} = Joi.validate(this.state.data, this.schema, options);
        console.log(error);

        if(!error) return null;
        const errors = {};
        for(let item of error.details) errors[item.path[0]]=item.message;
        return errors;
    };

    handleSubmit = e =>{
        e.preventDefault();

        const errors = this.validate();
        this.setState({errors: errors || {} } );
        if(errors) return;
        this.doSubmit();
    }

    handleChange = e => {
        const data = {...this.state.data};
        data[e.currentTarget.name] = e.currentTarget.value;
        this.setState({ data });
    }

    renderInput(name,label){

        const {data,errors} = this.state;
        return(<Input 
        name = {name} 
        label={label} 
        value = {data[name]}
        onChange={this.handleChange} 
        error = {errors[name]}/>)
    }

    renderButton(label){
        return (<button className="btn btn-default">{label}</button>);
    }

}
 
export default Form;