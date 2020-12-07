import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
import SampleResponseForm from './sampleResponseForm'
import DeleteModal from '../common/deleteModal'

class SampleResponse extends Component {
  constructor (props) {
    super(props)
    this.state = {
      showSampleResponseForm: {
        add: false,
        edit: false,
        delete: false
      }
    }
  }

  openAddForm (obj, index, name) {
    const showSampleResponseForm = { ...this.state.showSampleResponseForm }
    showSampleResponseForm.add = true
    this.setState({
      showSampleResponseForm,
      sampleResponseFormName: name,
      selectedSampleResponse: {
        ...obj
      },
      index
    })
  }

  showAddForm () {
    return (
      this.state.showSampleResponseForm.add && (
        <SampleResponseForm
          {...this.props}
          show
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          selectedSampleResponse={this.state.selectedSampleResponse}
          index={this.state.index}
        />
      )
    )
  }

  openEditForm (obj, index, name) {
    const showSampleResponseForm = { ...this.state.showSampleResponseForm }
    showSampleResponseForm.edit = true
    this.setState({
      showSampleResponseForm,
      sampleResponseFormName: name,
      selectedSampleResponse: {
        ...obj
      },
      index
    })
  }

  showEditForm () {
    return (
      this.state.showSampleResponseForm.edit && (
        <SampleResponseForm
          {...this.props}
          show
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          selectedSampleResponse={this.state.selectedSampleResponse}
          index={this.state.index}
        />
      )
    )
  }

  openDeleteForm (index, name) {
    const showSampleResponseForm = { ...this.state.showSampleResponseForm }
    showSampleResponseForm.delete = true
    this.setState({
      showSampleResponseForm,
      sampleResponseFormName: name,
      index
    })
  }

  showDeleteForm () {
    const msg = 'Are you sure you want to delete this sample response?'
    return (
      this.state.showSampleResponseForm.delete && (
        <DeleteModal
          {...this.props}
          show
          onHide={this.closeForm.bind(this)}
          title={this.state.sampleResponseFormName}
          index={this.state.index}
          message={msg}
        />
      )
    )
  }

  closeForm () {
    const showSampleResponseForm = { add: false, delete: false, edit: false }
    this.setState({ showSampleResponseForm })
  }

  deleteSampleResponse (sampleResponseArray, sampleResponseFlagArray, index) {
    sampleResponseArray.splice(index, 1)
    sampleResponseFlagArray.splice(index, 1)
    this.props.props_from_parent(sampleResponseArray, sampleResponseFlagArray)
  }

  render () {
    const sampleResponseArray = [...this.props.sample_response_array]
    const sampleResponseFlagArray = [...this.props.sample_response_flag_array]
    return (
      <div id='sample-response'>
        {
          isDashboardRoute(this.props)
            ? (
              <div className='add-sample-response'>
                <button
                  className='adddescLink'
                  onClick={() => this.openAddForm({}, null, 'Add Sample Response')}
                >
                  + Add Sample Response
                </button>
              </div>
              )
            : null
        }
        {this.showAddForm()}
        {this.showEditForm()}
        {this.showDeleteForm()}
        {sampleResponseArray.map((obj, index) => (
          <div key={index} className='sample-response-item'>
            {
              isDashboardRoute(this.props)
                ? (
                  <>
                    <span
                      className='sample-response-edit'
                      onClick={() =>
                        // this.deleteSampleResponse(
                        //   sampleResponseArray,
                        //   sampleResponseFlagArray,
                        //   index
                        // )
                        this.openDeleteForm(index, 'Delete Sample Response')}
                    >
                      <i class='fa fa-trash' aria-hidden='true' />
                    </span>
                    <span
                      className='sample-response-edit'
                      onClick={() =>
                        this.openEditForm(obj, index, 'Edit Sample Response')}
                    >
                      <i className='fas fa-pen' />
                    </span>
                  </>
                  )
                : null
            }
            <div className='response-item-status'>Title : {obj.title}</div>
            <div className='response-item-status'>Status : {obj.status}</div>
            <div className='response-item-description'>
              Description : {obj.description || ''}
            </div>
            <div className='response-item-body'>
              Body :{' '}
              {!sampleResponseFlagArray[index] && (
                <i
                  class='fa fa-caret-right'
                  aria-hidden='true'
                  onClick={() => this.props.open_body(index)}
                />
              )}
              {sampleResponseFlagArray[index] && (
                <>
                  <i
                    class='fa fa-caret-down'
                    aria-hidden='true'
                    onClick={() => this.props.close_body(index)}
                  />

                  <JSONPretty
                    // theme={JSONPrettyMon}
                    themeClassName='custom-json-pretty'
                    data={obj.data}
                  />
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    )
  }
}

export default SampleResponse
