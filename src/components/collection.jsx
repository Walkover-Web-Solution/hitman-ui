<<<<<<< HEAD
import React, { Component } from "react";
import NavBar from "./navbar";
import {Link} from "react-router-dom";
=======
import React from 'react'
import NavBar from './navbar'
>>>>>>> 3433db3771910cf9651b1b744f7550d9a2a9f3f5

class Collections extends Component {
  state = {  }
  render() { 
    return (     
    <div>
      <NavBar />
      <h1>Collections</h1>
<<<<<<< HEAD

      <button className="btn btn-success btn-lg">
          <Link to="/collections/new">Add Collection</Link>
        </button>
    </div> );
  }
}
 
export default Collections;
=======
    </div>
  )
}
// pass username
export default Collections
>>>>>>> 3433db3771910cf9651b1b744f7550d9a2a9f3f5
