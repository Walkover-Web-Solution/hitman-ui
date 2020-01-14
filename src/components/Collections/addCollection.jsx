import React, { Component } from 'react';
import { Link } from "react-router-dom";

class CollectionComponent extends Component {
    name = React.createRef();
    description = React.createRef();
    termsOfService = React.createRef();
     handleSubmit = e =>{
         e.preventDefault();

         console.log({
            "Name":this.name.current.value,
            "Description":this.description.current.value,
            "Terms of Service URL" : this.termsOfService.current.value
        });
     }
    render() { 
        return (
        
        <React.Fragment>
            <h1>Add new Collection</h1>
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="Collection Name">Collection Name</label>
                    <input ref={this.name} id = "Collection Name"type="text" className="form-control"/>
                </div>
                <div className="form-group">
                    <label htmlFor="Description">Description</label>
                    <input ref={this.description} id="Description" type="text" className="form-control"/>
                </div>
                <div className="form-group">
                    <label htmlFor="termsOfService">Terms of service URL</label>
                    <input ref={this.termsOfService} id="termsOfService" type="text" className="form-control"/>
                </div>
                <button className="btn btn-default"> Submit </button>
                <span>
                <button className="btn btn-default">
                <Link to="/collections">Cancel</Link>
                </button>
                </span>
            </form>
        </React.Fragment> ) 
    }
}
 
export default CollectionComponent;