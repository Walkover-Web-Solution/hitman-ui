import React, { Component } from 'react'
import { Accordion, Card, Button, ListGroup } from 'react-bootstrap'
import { Link } from 'react-router-dom'

class Collections2 extends Component {
  state = {}
  render () {
    return (
      <Accordion defaultActiveKey='0' style={{ width: '300px' }}>
        <Card>
          <Card.Header>
            <Accordion.Toggle variant='link' eventKey='0'>
              <div>
                <div>Click me!</div>
              </div>
            </Accordion.Toggle>
            <div style={{ float: 'right' }}>
              <button className='btn1'>...</button>
            </div>
          </Card.Header>
          <Accordion.Collapse eventKey='0'>
            <Card.Body>
              <ListGroup>
                <ListGroup.Item>
                  <Accordion defaultActiveKey='0'>
                    <Card>
                      <Card.Header>
                        <Accordion.Toggle
                          as={Button}
                          variant='link'
                          eventKey='0'
                        >
                          Click me!
                        </Accordion.Toggle>
                      </Card.Header>
                      <Accordion.Collapse eventKey='0'>
                        <Card.Body>Hello! I'm the body</Card.Body>
                      </Accordion.Collapse>
                    </Card>
                  </Accordion>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Accordion.Collapse>
        </Card>
        <Card>
          <Card.Header>
            <Accordion.Toggle as={Button} variant='link' eventKey='1'>
              Click me!
            </Accordion.Toggle>
          </Card.Header>
          <Accordion.Collapse eventKey='1'>
            <Card.Body>Hello! I'm another body</Card.Body>
          </Accordion.Collapse>
        </Card>
      </Accordion>
    )
  }
}

export default Collections2
