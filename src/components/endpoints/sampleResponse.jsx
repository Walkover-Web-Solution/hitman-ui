import React, { Component } from 'react'
import { isDashboardRoute } from '../common/utility'
import JSONPretty from 'react-json-pretty'
import './endpoints.scss'
import SampleResponseForm from './sampleResponseForm'
import DeleteModal from '../common/deleteModal'
import DownArrow from '../../assets/icons/downChevron.svg'

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

  showJSONPretty (data) {
    return (
      <JSONPretty
        themeClassName='custom-json-pretty'
        data={data}
      />
    )
  }

  showSampleResponseBody (data) {
    if (typeof data === 'object') {
      return (this.showJSONPretty(data))
    } else {
      try {
        data = JSON.parse(data)
        return this.showJSONPretty(data)
      } catch (err) {
        return <pre>{data}</pre>
      }
    }
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
                  <svg width='16' height='16' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 3.75V14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M3.75 9H14.25' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg> Add Sample Response
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
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'>
                        <path d='M2.25 4.5H3.75H15.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M6 4.5V3C6 2.60218 6.15804 2.22064 6.43934 1.93934C6.72064 1.65804 7.10218 1.5 7.5 1.5H10.5C10.8978 1.5 11.2794 1.65804 11.5607 1.93934C11.842 2.22064 12 2.60218 12 3V4.5M14.25 4.5V15C14.25 15.3978 14.092 15.7794 13.8107 16.0607C13.5294 16.342 13.1478 16.5 12.75 16.5H5.25C4.85218 16.5 4.47064 16.342 4.18934 16.0607C3.90804 15.7794 3.75 15.3978 3.75 15V4.5H14.25Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M7.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                        <path d='M10.5 8.25V12.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' />
                      </svg>

                    </span>
                    <span
                      className='sample-response-edit'
                      onClick={() =>
                        this.openEditForm(obj, index, 'Edit Sample Response')}
                    >
                      <svg width='18' height='18' viewBox='0 0 18 18' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M9 15H15.75' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /><path d='M12.375 2.62517C12.6734 2.3268 13.078 2.15918 13.5 2.15918C13.7089 2.15918 13.9158 2.20033 14.1088 2.28029C14.3019 2.36024 14.4773 2.47743 14.625 2.62517C14.7727 2.77291 14.8899 2.9483 14.9699 3.14132C15.0498 3.33435 15.091 3.54124 15.091 3.75017C15.091 3.9591 15.0498 4.16599 14.9699 4.35902C14.8899 4.55204 14.7727 4.72743 14.625 4.87517L5.25 14.2502L2.25 15.0002L3 12.0002L12.375 2.62517Z' stroke='#E98A36' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' /></svg>
                    </span>
                  </>
                  )
                : null
            }
            <div className='response-item-status'> <h2 className='heading-3'>Title</h2> : {obj.title}</div>
            <div className='response-item-status'> <h2 className='heading-3'>Status</h2> : {obj.status}</div>
            <div className='response-item-status'>
              <h2 className='heading-3'>Description</h2> : {obj.description || ''}
            </div>
            <div className='response-item-status'>
              <h2 className='heading-3'>Body</h2> :{' '}
              {!sampleResponseFlagArray[index] && (

                <img src={DownArrow} alt='down-arrow' className='arrowRight' onClick={() => this.props.open_body(index)} />
              )}
              {sampleResponseFlagArray[index] && (
                <>
                  <img src={DownArrow} alt='down-arrow' onClick={() => this.props.close_body(index)} />
                  {this.showSampleResponseBody(obj.data)}
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
