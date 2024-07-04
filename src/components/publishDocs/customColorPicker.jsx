import React, { useState, useEffect, useCallback } from 'react';
import { CustomPicker, TwitterPicker } from 'react-color';

const colors = ['#f2994a', '#7DCCEE', '#27AE60', '#F0BD3B', '#DD755E', '#333333'];

const CustomColorPicker = (props) => {
  const [theme, setTheme] = useState(props.theme || '');
  const [openColorPicker, setOpenColorPicker] = useState(false);

  useEffect(() => {
    if (props.theme) {
      setTheme(props.theme);
    }
  }, [props.theme]);

  const handleChangeComplete = useCallback(
    (color) => {
      setTheme(color.hex);
      props.set_theme(color.hex);
    },
    [props]
  );

  const customColor = {
    backgroundColor: theme,
    height: '40px',
    width: '40px',
    borderRadius: '4px',
  };

  return (
    <>
      <div className='d-flex align-items-center justify-content-between'>
        <div>
          <TwitterPicker
            triangle='hide'
            colors={colors}
            color={theme}
            onChangeComplete={handleChangeComplete}
            width='400px'
          />
        </div>
        <div style={customColor} />
      </div>
    </>
  );
};

export default CustomPicker(CustomColorPicker);
