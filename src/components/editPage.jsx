import React, { Component } from 'react'
import pageService from '../services/pageService'

class EditPage extends Component {
  name = React.createRef()
  contents = React.createRef()

  state = {
    data: {
      pageId: null,
      versionId: null,
      groupId: null,
      name: '',
      contents: ''
    },
    errors: {}
  }

  componentDidMount () {
    let data = {}
    if (this.props.location.page) {
      const {
        id,
        versionId,
        groupId,
        name,
        contents
      } = this.props.location.page

      data = {
        pageId: id,
        versionId,
        groupId,
        name,
        contents
      }
      this.setState({ data })
    }
  }

  handleChange = e => {
    const data = { ...this.state.data }
    data[e.currentTarget.name] = e.currentTarget.value
    this.setState({ data })
  }

  handleSubmit = e => {
    e.preventDefault()
    const groupId = this.state.data.groupId
    if (groupId === null) {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedPage: { ...this.state.data }
      })
    } else {
      this.props.history.push({
        pathname: `/dashboard/collections`,
        editedPage: { ...this.state.data },
        groupId: { ...this.state.data.groupId }
      })
    }
  }

  render () {
    return (
      <form onSubmit={this.handleSubmit}>
        <div class='form-group'>
          <label for='exampleFormControlInput1'>Page Name</label>
          <input
            ref={this.name}
            type='text'
            name='name'
            class='form-control'
            id='name'
            value={this.state.data.name}
            onChange={this.handleChange}
          />
        </div>
        <div class='form-group'>
          <label for='exampleFormControlTextarea1'>Contents</label>
          <textarea
            ref={this.contents}
            class='form-control'
            value={this.state.data.contents}
            onChange={this.handleChange}
            name='contents'
            id='contents'
            rows='20'
          />
          <button type='submit' class='btn btn-primary'>
            Submit
          </button>
        </div>
      </form>
    )
  }
}

export default EditPage
