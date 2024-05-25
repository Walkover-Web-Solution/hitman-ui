import React from 'react';
import './iconButton.scss'

export default function IconButton(props) {
  return (
    <div className={props?.variant === 'sm' ? 'icon-button-sm' : 'icon-button'}>
      {props.children}
    </div>
  )
}