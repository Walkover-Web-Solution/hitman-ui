import React, { forwardRef } from "react"

const Input = forwardRef(({ name, label, value, onChange, onBlur, error, placeholder, disabled, mandatory, firstLetterCapitalize, note }, ref) => {
  const inputStyle = firstLetterCapitalize ? { textTransform: "capitalize" } : {}
  return (
    <div className='form-group'>
      <label htmlFor={name} className='custom-input-label'>
        {label}
      </label>
      {mandatory && <span className='alert alert-danger'> *</span>}
      <input ref={ref} value={value} onChange={onChange} onBlur={onBlur} id={name} name={name} className='form-control custom-input' type='text' placeholder={placeholder} disabled={disabled} style={inputStyle} />
      <div>
        <small className='muted-text'>{note}</small>
      </div>
      {error && <div className='alert alert-danger'>{error}</div>}
    </div>
  )
})

export default Input
