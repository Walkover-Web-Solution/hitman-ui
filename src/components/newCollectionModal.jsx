import React, { Component } from 'react';
import {Modal,Row,Col,Form,Button,ButtonToolbar} from 'react-bootstrap';
import Input from './common/input'

class NewCollectionModal extends Component {

  state = { 
    modalShow : false,
    data:{
                name: "",
                website: "",
                keywords: "",
                description:""
    },
        errors:{}
   }


   handleChange = e => {
    const data = {...this.state.data};
    data[e.currentTarget.name] = e.currentTarget.value;
    
    this.setState({ data });
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
      <form >
        <Input name = "name" label="Name*" onChange={this.handleChange}/>
        <Input name = 'website' label='Website*' onChange={this.handleChange}/>
        <Input name = 'keywords' label='Keywords*'  onChange={this.handleChange}/>
        <Input name = 'description' label='Description'  onChange={this.handleChange}/>
            
        {/* <button type="submit" className="btn btn-primary">Submit</button> */}

        </form>
        <button type="submit" onClick={()=>{window.location = '/collections'}} className="btn btn-primary">Submit</button>
      </Modal.Body>
      <Modal.Footer>
      
        <Button onClick={this.props.onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );}
}

export default NewCollectionModal;
