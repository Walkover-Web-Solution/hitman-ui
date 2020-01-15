import React, { Component } from 'react';
import { Link } from "react-router-dom";
import Input from "./input";

class CollectionComponent extends Component {

    name = React.createRef();
    termsOfService = React.createRef();
    keywords = React.createRef();
    description = React.createRef();
    
     handleSubmit = e =>{
         e.preventDefault();

         console.log({
            "Name":this.name.current.value,
            "Terms of Service URL" : this.termsOfService.current.value,
            "Keywords": this.keywords.current.value,
            "Description":this.description.current.value
            
        });
     }
    render() { 
        return (
        
        <React.Fragment>
            <h1>Add new Collection</h1>
            <form onSubmit={this.handleSubmit}>

                <Input name = "collectionName" label="Name*" Ref={this.name}/>
                <Input name = "termsOfService" label="Terms of service URL*" Ref={this.termsOfService}/>
                <Input name = "keywords" label="Keywords*" Ref={this.keywords}/>
                <Input name = "Description" label="Description" Ref={this.description}/>
                
                <button className="btn btn-default"> Submit </button>
                
                <button className="btn btn-default">
                <Link to="/collections">Cancel</Link>
                </button>
               
            </form>
        </React.Fragment> ) 
    }
}
 
export default CollectionComponent;