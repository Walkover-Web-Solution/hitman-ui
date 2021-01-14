import React from 'react'
import Form from '../common/form'
import Joi from 'joi-browser'
import { connect } from 'react-redux'
import { updateEndpoint } from './redux/endpointsActions'
import { isDashboardRoute } from '../common/utility'
import ReactHtmlParser from 'react-html-parser'

const mapDispatchToProps = (dispatch) => {
  return {
    update_endpoint: (data) =>
      dispatch(updateEndpoint(data))
  }
}

export class Notes extends Form {
  constructor (props) {
    super(props)
    this.schema = {
      description: Joi.string().allow(null, '').label('Description')
    }

    this.state = {
      data: {
        description: props.note
      },
      theme: props.publicCollectionTheme
    }
  }

  doSubmit () {
    const data = {
      id: this.props.endpointId,
      notes: this.state.data.description
    }
    this.props.update_endpoint(data)
  }

  renderNote () {
    const endpointId = this.props.match.params.endpointId

    return (
      <div className='pub-notes' style={{ borderLeftColor: this.state.theme }}>
        {ReactHtmlParser(this.props.endpoints[endpointId]?.notes) || ''}
      </div>
    )
  }

  renderForm () {
    return (
      <>
        <div className='des-wrapper'>
          <form onSubmit={this.handleSubmit}>
            {this.renderQuillEditor('description', 'Add additional information')}

            <div className='quicn-actions'>
              <button
                className='btn btn-secondary outline'
                type='reset' onClick={(e) => {
                  this.setState({ data: { ...this.state.data, description: '' } })
                }}
              >
                Clear
              </button>
              <button type='submit' className='btn btn-primary'>
                Save
              </button>

            </div>
          </form>
        </div>
      </>
    )
  }

  render () {
    return (
      <div>
        {!isDashboardRoute(this.props, true)
          ? this.renderNote()
          : this.renderForm()}

      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(Notes)
