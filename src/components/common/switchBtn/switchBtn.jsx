import React from "react";
import "./switchBtn.scss";

const SwitchBtn = ({ isOn, handleToggle }) => {
    return (
        <div className="switch-btn">
            <input checked={isOn} onChange={handleToggle} className="react-switch-checkbox" id={`react-switch-new`} type="checkbox" />
            <label className="react-switch-label" htmlFor={`react-switch-new`}>
                <span className="react-switch-button" />
            </label>
        </div>
    );
};

export default SwitchBtn;