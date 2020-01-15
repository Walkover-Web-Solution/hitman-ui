import React from 'react';

const Input = ({name,label,Ref})=>{
    return(
        <div className="form-group">
                    <label htmlFor={name}>{label}</label>
                    <input ref={Ref} id = {name}type="text" className="form-control"/>
        </div>
    );
};
export default Input;