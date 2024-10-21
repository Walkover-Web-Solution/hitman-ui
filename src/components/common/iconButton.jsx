import React from 'react';
import './iconButton.scss'

export default function IconButton(props) {
  return (
    <div onClick={props?.onClick} className={props?.variant === 'sm' ? 'icon-button-sm cursor-pointer' : 'icon-button cursor-pointer'}>
      {props.children}
    </div>
  )
}