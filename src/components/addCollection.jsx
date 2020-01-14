import React, { Component } from 'react';
import { Link } from "react-router-dom";

class CollectionComponent extends Component {
   
     handleSubmit = e =>{
         e.preventDefault();

         console.log("Submitted");
     }
    render() { 
        return (
        <React.Fragment>
            <h1>Add new Collection</h1>
            <form onSubmit={this.handleSubmit}>
                <div className="form-group">
                    <label htmlFor="Collection Name">Collection Name</label>
                    <input id = "Collection Name"type="text" className="form-control"/>
                </div>
                <div className="form-group">
                    <label htmlFor="Description">Description</label>
                    <input id="Description" type="text" className="form-control"/>
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