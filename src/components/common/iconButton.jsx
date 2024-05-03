import React from 'react';
import './iconButton.scss'

export default function IconButton(props) {
  return (
    <div className='icon-button'>
      {props.children}
    </div>
  )
}