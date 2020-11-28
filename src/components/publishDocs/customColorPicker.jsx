import React from 'react'
import { CustomPicker, CirclePicker } from 'react-color'

const colors = ['#f2994a', '#686EFF', '#7DCCEE', '#27AE60', '#F0BD3B', '#DD755E']

class CustomColorPicker extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      data: {
        theme: ''
      }
    }
  }

  componentDidMount () {
    if (this.props.theme) {
      const data = { ...this.state.data }
      data.theme = this.props.theme
      this.setState({ data })
    }
  }

  componentDidUpdate (prevProps, prevState) {
    if (prevProps !== this.props) {
      const data = { ...this.state.data }
      data.theme = this.props.theme
      this.setState({ data })
    }
  }

  toggleColorOption () {
    this.setState({
      openColorPicker: !this.state.openColorPicker
    })
  }

  handleChangeComplete = (color) => {
    const data = { ...this.state.data }
    data.theme = color.hex
    this.setState({
      data
    })
    this.props.set_theme(color.hex)
  }

  render () {
    return (
      <>
        <div>
          <CirclePicker
            colors={colors}
            color={this.state.data.theme}
            onChangeComplete={this.handleChangeComplete}
          />
        </div>
      </>
    )
  }
}

export default CustomPicker(CustomColorPicker)
