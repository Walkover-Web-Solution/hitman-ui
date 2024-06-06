import React from 'react'
import { CustomPicker, TwitterPicker } from 'react-color'

const colors = ['#f2994a', '#7DCCEE', '#27AE60', '#F0BD3B', '#DD755E', '#333333']

class CustomColorPicker extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      data: {
        theme: ''
      }
    }
  }

  componentDidMount() {
    if (this.props.theme) {
      const data = { ...this.state.data }
      data.theme = this.props.theme
      this.setState({ data })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps !== this.props) {
      const data = { ...this.state.data }
      data.theme = this.props.theme
      this.setState({ data })
    }
  }

  toggleColorOption() {
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

  render() {
    const customColor = {
      backgroundColor: this.state.data.theme,
      height: '40px',
      width: '40px',
      borderRadius: '4px',
    }
    return (
      <>
        <div className='d-flex align-items-center justify-content-between'>
          <div>
            <TwitterPicker
              triangle='hide'
              colors={colors}
              color={this.state.data.theme}
              onChangeComplete={this.handleChangeComplete}
              width='400px'
            />
          </div>
          <div style={customColor} />
        </div>
      </>
    )
  }
}

export default CustomPicker(CustomColorPicker)
