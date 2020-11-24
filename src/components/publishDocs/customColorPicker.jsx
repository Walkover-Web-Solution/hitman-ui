import React from 'react'
import { CustomPicker, TwitterPicker } from 'react-color'

// const colorPickerEnum = {
//   COLOR1: '#dd755e',
//   COLOR2: '#686eff',
//   COLOR3: '#7dccee',
//   COLOR4: '#27ae60',
//   COLOR5: '#f2994a'

// }

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
          <TwitterPicker
            color={this.state.data.theme}
            onChangeComplete={this.handleChangeComplete}
          />
        </div>
      </>
    )
  }
}

export default CustomPicker(CustomColorPicker)
