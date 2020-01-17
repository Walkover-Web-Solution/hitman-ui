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
  }

  render() { 
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
            </tr>
          </thead>
          <tbody>
            {this.state.posts.map(post => (
              <tr key={post.id}>
                <td>{post.title}</td>
              </tr>
            ))}
          </tbody>
        </table>
    </div> );
  }
}
 
export default Collections;
