import React, { Component } from 'react'
import { Modal, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
class EndpointHeaders extends Component {
    state = {    headersData: {},
                 originalHeadersKeys:[],
                 updatedHeadersKeys:[]
   
}
async componentDidMount () {
    let headersData={...this.state.headersData};
    const originalHeadersKeys = Object.keys(headersData)
    const updatedHeadersKeys = Object.keys(environment)
    this.setState({
      headersData,
      originalHeadersKeys,
      updatedHeadersKeys
    })
  }

handleAdd () {
    let headersData = [ ...this.state.headersData ,"key"]
   
    this.setState(headersData)
  }
  handleDelete(index){
      const headersData=this.state.headersData
      
  }
    render() { 
        this.props.call_data("dasdfsdf ta");
        return (
              <form onSubmit={()=>{console.log("submitted")}}>
                
                <div>
                  <Table bordered size='sm'>
                    <thead>
                      <tr>
                        <th>Key</th>
                        <th>Value</th>
                        <th>Description</th>
                      </tr>
                    </thead>
      
                     <tbody>
                      {[].map((variable, index) =>
                        variable !== 'deleted' ? (
                          <tr key={index}>
                            <td>
                              <input
                                name={index + '.key'}
                                // value={variable}
                                // onChange={this.handleChange}
                                type={'text'}
                                style={{ border: 'none' }}
                                className='form-control'
                              />
                            </td>
                            <td>
                              {' '}
                              <input
                                name={index + '.value'}
                                // value={
                                //   this.state.header.variables[
                                //     this.state.[index]
                                //   ].initialValue
                                // }
                                // onChange={this.handleChange}
                                type={'text'}
                                className='form-control'
                                style={{ border: 'none' }}
                              />
                            </td>
                            <td>
                              {' '}
                              <input
                                name={index + '.description'}
                                // value={
                                //   this.state.header.variables[
                                //     this.state.originalVariableNames[index]
                                //   ].currentValue
                                // }
                                // onChange={this.handleChange}
                                type={'text'}
                                style={{ border: 'none' }}
                                className='form-control'
                              />
                            </td>
                            <td>
                              <button
                                type='button'
                                class='btn btn-light btn-sm btn-block'
                                // onClick={() => this.handleDelete(index)}
                              >
                                x{' '}
                              </button>
                            </td>
                          </tr>
                        ) : null
                      )}
                      <tr>
                        <td> </td>
                        <td>
                          {' '}
                          <button
                            type='button'
                            class='btn btn-link btn-sm btn-block'
                             onClick={() => this.handleAdd()}
                          >
                            + New Header
                          </button>
                        </td>
                        <td> </td>
                        <td> </td>
                      </tr>
                    </tbody> */}
                  </Table>
                  <Link
                    to={`/dashboard`}
                    style={{ float: 'right', padding: '10px 60px 0 0' }}
                  >
                    Cancel
                  </Link>
                </div>
              </form>
           
          )
    }
}
 
export default EndpointHeaders 