import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Input from "./common/input";
import Form from "./common/form";
import Joi from 'joi-browser';

class CollectionComponent extends Form {

    state={
        data: {
            name: "",
            website: "",
            keywords: "",
            description:""
        },
        errors: {}
    }

    schema = {
        name: Joi.string().required().label('Username'),
        website: Joi.string().required().label('Website'),
        keywords: Joi.string().required().label('Keywords'),
        description: Joi.string().allow(null,'').label('Description')
    }

     doSubmit(){
        console.log("Submitted");
        console.log(this.state.data);
     }

    render() { 
        
        return (
        
        <React.Fragment>
            <h1>Add new Collection</h1>
            <form onSubmit={this.handleSubmit}>

                {this.renderInput('name','Name*')}
                {this.renderInput('website','Website*')}
                {this.renderInput('keywords','Keywords*')}
                {this.renderInput('description','Description')}
                
                {this.renderButton("Submit")}
                <button className="btn btn-default">
                <Link to="/collections">Cancel</Link>
                </button>
               
            </form>
        </React.Fragment> ) 
    }
}
 
export default CollectionComponent;