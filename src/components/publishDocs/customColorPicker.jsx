import React from 'react';
import { CustomPicker ,TwitterPicker} from 'react-color';

const colorPickerEnum = {
  COLOR1 : "#dd755e",
  COLOR2 : "#686eff",
  COLOR3 : "#7dccee",
  COLOR4 : "#27ae60",
  COLOR5 : "#f2994a",

}

class CustomColorPicker extends React.Component {

  state ={
    data : {
      theme  : ""
    }
  }

  componentDidMount() {
      if(this.props.theme){
        let data = {...this.state.theme}
        data.theme = this.props.theme
        this.setState({ data })
      }
  }

  toggleColorOption(){
    this.setState({
      openColorPicker : !this.state.openColorPicker
    })
  }


  handleChangeComplete=(color)=>{
      let data = {...this.state.data}
      data.theme = color.hex
      this.setState({
        data
      })
      this.props.set_theme(color.hex)
    
  }

  render() {
    return (
    <React.Fragment>
    <div>
      {
          <TwitterPicker
          color = {this.state.data.theme}
           onChangeComplete={this.handleChangeComplete }/>
     }
    </div>
    </React.Fragment>
    )
  }
}

export default CustomPicker(CustomColorPicker);