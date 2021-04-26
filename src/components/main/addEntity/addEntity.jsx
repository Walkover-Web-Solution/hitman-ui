import React, { Component } from 'react'
import Joi from 'joi-browser'
import './addEntity.scss'
import { toTitleCase } from '../../common/utility'

const entityENUM = {
  endpoint: {
    key: 'endpoint',
    message: 'This group is empty, Add endpoint to start working'
  },
  version: {
    key: 'version',
    message: 'This collection is empty, Add version to start working'
  },
  group: {
    key: 'group',
    message: 'This version is empty, Add group to start working'
  }
}

export class AddEntity extends Component {
    state={
      entityName: '',
      errors: {}
    }

    schema = {
      entityName: Joi.string().required().min(2).max(30).trim().label(`${this.props.type} name`)
    };

    validate () {
      const options = { abortEarly: false }
      const { error } = Joi.validate({ entityName: this.state.entityName }, this.schema, options)
      if (!error) return null
      const errors = {}
      for (const item of error.details) errors[item.path[0]] = item.message
      return errors
    };

    handleChange (e) {
      this.setState({ entityName: e.target.value, errors: {} })
    }

    handleSubmit (e) {
      e.preventDefault()
      if (this.props.type && this.props.type === 'endpoint') {
        const endpoint = this.props.endpoint
        const errors = this.validate()
        if (errors) {
          this.setState({ errors })
          return
        }
        endpoint.name = toTitleCase(this.state.entityName)
        this.props.addEndpoint(endpoint)
      } else {
        this.props.addNewEntity(this.props.entity)
      }
    }

    renderForm () {
      return (
        <form onSubmit={(e) => { this.handleSubmit(e) }} className='quick-add-endpoint'>
          <p>{entityENUM[this.props.type].message}</p>
          {this.props.type && this.props.type === 'endpoint' &&
            <div>
              <input
                name={this.props.type || 'name'} placeholder={this.props.placeholder} className='entity-input'
                value={this.state.entityName} onChange={(e) => { this.handleChange(e) }}
              />
              <small className='entity-name-error'> {this.state.errors.entityName}</small>
            </div>}
          <div>
            <button type='submit' className='entity-submit-btn'>{`Add ${this.props.type}`}</button>
          </div>
        </form>
      )
    }

    render () {
      return (
        <div>
          {this.renderForm()}
        </div>
      )
    }
}

export default AddEntity
