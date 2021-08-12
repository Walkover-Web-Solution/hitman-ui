import React from 'react'
import Form from '../common/form'
import Joi from 'joi-browser'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { updateEndpoint } from './redux/endpointsActions'
import { isDashboardRoute, isSavedEndpoint } from '../common/utility'
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
      theme: props.publicCollectionTheme,
      showAdditionalInfo: false
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.props.note !== prevProps.note) {
      this.setState({ data: { ...this.state.data, description: this.props.note } })
    }
  }

  doSubmit () {
    const data = {
      id: this.props.endpointId,
      notes: this.state.length === 0 ? '' : this.state.data.description
    }
    this.props.update_endpoint(data)
    this.props.submitNotes(data)
    this.setState({ isSaveDisabled: true })
  }

  renderNote () {
    return (
      this.state.data.description.length !== 0 &&
        <div className='pub-notes' style={{ borderLeftColor: this.state.theme }}>
          {ReactHtmlParser(this.state.data.description) || ''}
        </div>
    )
  }

  toggelAdditionalInfo () {
    const showAdditionalInfo = !this.state.showAdditionalInfo
    this.setState({ showAdditionalInfo })
  }

  renderForm () {
    return (
      <>
        <Link
          class='adddescLink'
          onClick={() => this.toggelAdditionalInfo()}
        >
          {this.state.showAdditionalInfo ? 'HIDE ADDITIONAL INFORMATION' : 'ADD ADDITIONAL INFORMATION'}
        </Link>
        {this.state.showAdditionalInfo &&
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
                <button disabled={this.getSaveDisableStatus(undefined, true)} type='submit' className='btn btn-primary'>
                  Save
                </button>

              </div>
            </form>
          </div>}
      </>
    )
  }

  render () {
    return (
      <div>
        {!isDashboardRoute(this.props)
          ? this.renderNote()
          : isSavedEndpoint(this.props) && this.renderForm()}

      </div>
    )
  }
}

export default connect(null, mapDispatchToProps)(Notes)
