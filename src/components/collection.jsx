import React, { Component } from "react";
import { Route, Switch } from 'react-router-dom'
import NavBar from "./navbar";
import {Link} from "react-router-dom";
import http from '../services/httpService';
import NewCollectionModal from './newCollectionModal';

class Collections extends Component {
  state = { 
    posts:[]
   }
   
   async componentDidMount(){
  
      //const {data: posts } = await http.get("https://jsonplaceholder.typicode.com/posts");
      //console.log(posts);
      //this.setState({posts});
      this.props.history.replace({ pathname: "/collections", state: null })
  }

  handleAdd(newCollection){

      console.log(newCollection)
      console.log(this.state.posts)
      const posts = [newCollection, ...this.state.posts]
      
      console.log(posts)
      this.state.posts = posts
      //const {data: posts } = await http.get("https://jsonplaceholder.typicode.com/posts");
      //console.log(posts);
      //this.setState({posts});
      
  }

  handleDelete = post =>{
    this.props.history.replace({ pathname: "/collections", state: null })
    const posts  = this.state.posts.filter(p=>p.website !== post.website);
    this.setState({posts});
  }

  handleUpdate(){

  }

  render() { 

    if(this.props.location.state){
      this.handleAdd(this.props.location.state);
    }
      
    
    return (     
    <div>
      <NavBar />
      <h1>Collections</h1>

      { <button className="btn btn-success btn-lg">
          <Link to="/collections/new">Add Collection</Link>
        </button> }

        <div className="tabs">
          <Switch>
          <Route path='/collections/new' render={(props) => <NewCollectionModal show={true} onHide={()=>{window.location = '/collections'}} />} />
          </Switch>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Update</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {this.state.posts.map(post => (
              <tr key={post.website}>
                <td>{post.name}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => this.handleUpdate(post)}
                  >
                    Update
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => this.handleDelete(post)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div> );
  }
}
 
export default Collections;
