import React, { Component } from 'react';
import { Link } from "react-router-dom";
import {Modal,Row,Col,Button,ButtonToolbar} from 'react-bootstrap';
import Input from './common/input'
import Form from "./common/form";
import Joi from 'joi-browser';

class NewCollectionModal extends Form {

  state = { 
    data:{
                name: "",
                website: "",
                keywords: "",
                description:""
    },
        errors:{}
   }

   schema = {
    name: Joi.string().required().label('Username'),
    website: Joi.string().required().label('Website'),
    keywords: Joi.string().required().label('Keywords'),
    description: Joi.string().allow(null,'').label('Description')
}

async doSubmit(props){

  //Post request to Backend
  //const { data: resp }= await http.post(createApiEndpoint, {this.state.data})
  // console.log("Submitted");
  console.log(this.state.data);
}
  render(){
    return (
    <Modal
      {...this.props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          Add new Collection
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
      </Modal.Body>
    </Modal>
  );}
}

export default NewCollectionModal;
