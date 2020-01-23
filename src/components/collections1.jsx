import React from 'react'
import ReactDOM from 'react-dom'
import collectionsservice from '../services/collectionsService'
import TreeMenu from 'react-simple-tree-menu'
import NavBar from './navbar'
import { Link } from 'react-router-dom'
import collectionversionsservice from '../services/collectionVersionServices'
class Comp extends React.Component {
  state = {
    collections: [],
    selectedcollection: {}
  }

  async fetchVersions (collectionId, index) {
    collectionversionsservice.setcollectionId(collectionId)
    const {
      data: collectionVersions
    } = await collectionversionsservice.getCollectionVersions()
    let collections = this.state.collections
    collections[index].collectionVersions = collectionVersions
    this.setState({ collections })
  }

  async componentDidMount () {
    const { data: collections } = await collectionsservice.getCollections()
    this.setState({ collections })
    this.state.collections.map((collection, index) =>
      this.fetchVersions(collection.identifier, index)
    )
    this.props.history.replace({ newCollection: null })
    console.log(this.state.collections)
  }
  render () {
    return (
      <div>
        <div className='App-Nav'>
          <NavBar />
        </div>
        <div className='App-Side'>
          {/* <h1>Collections</h1>
					<TreeMenu data={this.state.collections} hasSearch={false} onClickItem={this.handleClick} />
					<button onClick={this.handleExpandTree}>Expand tree</button> */}
          <button className='btn btn-success btn-lg'>
            <Link to='/collections/new'>Add Collection</Link>
          </button>
          <ul
            style={{
              listStyleType: 'none',
              paddingLeft: '0px',
              paddingRight: '0px',
              border: '3px solid rgb(204, 204, 204)',
              margin: '0px 0px 0px 0px'
            }}
          >
            {this.state.collections.map((collection, index) => (
              <div>
                <li
                  style={{
                    padding: '0.75rem 1rem 0.75rem 0.75rem',
                    cursor: 'pointer',
                    color: 'rgb(51, 51, 51)',
                    background: 'none',
                    borderTop: '3px solid rgb(204, 204, 204)',
                    borderBottom: '1px dashed rgb(204, 204, 204)',
                    boxShadow: 'none',
                    zIndex: 'unset',
                    position: 'relative'
                  }}
                >
                  {collection.name}
                  <button style={{ float: 'right' }}>... </button>
                </li>
                {this.state.collections[index].collectionVersions &&
                  this.state.collections[index].collectionVersions.map(
                    (collectionVersion, index1) => (
                      <React.Fragment>
                        <tr key={collectionVersion.id}>
                          <td>
                            {' '}
                            {index1 + 1}... {collectionVersion.number}
                          </td>
                          <td>
                            <button
                              className='btn btn-info btn-sm'
                              onClick={() => this.handleUpdate(collection)}
                            >
                              Edit
                            </button>
                          </td>
                          <td>
                            <button
                              className='btn btn-danger btn-sm'
                              onClick={() => this.handleDelete(collection)}
                            >
                              Delete
                            </button>
                          </td>
                          <td>
                            <button
                              className='btn btn-info btn-sm'
                              onClick={() =>
                                this.props.history.push(
                                  `/collections/${collection.identifier}/versions`
                                )
                              }
                            >
                              Versions
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    )
                  )}
              </div>
            ))}
          </ul>
        </div>
        <div className='App-Main'>
          <h1>Main</h1>
        </div>
      </div>
    )
  }
}
export default Comp
