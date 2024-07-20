import React from "react";
import Input from "../input";

const RenderInput = ({name, urlName, label, placeholder, mandatory = false, note = '', isURLInput = false, inputRef, data, errors, handleChange, handleBlur}) => {
    return (
        <Input
        ref={inputRef}
        name={name}
        urlName={urlName}
        label={label}
        value={data[name]}
        onChange={(e) => handleChange(e, isURLInput)}
        onBlur={(e) => handleBlur(e, isURLInput)}
        error={errors?.[name]}
        placeholder={placeholder}
        disabled={data.disabled}
        mandatory={mandatory}
        note={note}
      />
    )
}

export default RenderInput