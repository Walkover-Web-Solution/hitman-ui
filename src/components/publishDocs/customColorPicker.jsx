import React from 'react';
import { CustomPicker ,TwitterPicker} from 'react-color';
import { Overlay,Popover  } from 'react-bootstrap';

import PlusIcon from '../../assets/icons/plus.svg'

const colorPickerEnum = {
  COLOR1 : "#dd755e",
  COLOR2 : "#686eff",
  COLOR3 : "#7dccee",
  COLOR4 : "#27ae60",
  COLOR5 : "#f2994a",

}

class MyColorPicker extends React.Component {

  state ={
    openColorPicker : false
  }

  toggleColorOption(){
    this.setState({
      openColorPicker : !this.state.openColorPicker
    })
  }


  handleThemeChange (color){
    const element =   document.getElementById("1");
    console.log(element.className)
  }


  handleChangeComplete=(color)=>{
    console.log("color",color)
  }

  render() {
    return (
      <React.Fragment>
    <div style = {{display : "flex"}}>
      {/* <div id = "1" className = "custom-color color1" onClick = {(e)=>this.handleThemeChange(e)}></div>
      <div  className = "custom-color color2" onClick = {()=>this.handleThemeChange(colorPickerEnum. COLOR2)}></div>
      <div  className = "custom-color color3" onClick = {()=>this.handleThemeChange(colorPickerEnum. COLOR3)}></div>
      <div  className = "custom-color color4" onClick = {()=>this.handleThemeChange(colorPickerEnum. COLOR4)}>  </div>
      <div  className = "custom-color color5" onClick = {()=>this.handleThemeChange(colorPickerEnum. COLOR5)}>  </div>
      <div  className = "custom-color dashed-border" onClick = {()=>this.toggleColorOption()} ><img src={PlusIcon} alt=""/> </div> */}

    </div>
    <div>
      {
          <TwitterPicker onChangeComplete={this.handleChangeComplete }/>
     }
    </div>
    </React.Fragment>
    )
  }
}

export default CustomPicker(MyColorPicker);