import React, { useState } from 'react';
import './tagInput.scss';

const TagInput = () => {
  const [tags, setTags] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputBlur = () => {
    if (inputValue.trim()) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
      setIsExpanded(true);
    }
    setIsFocused(false);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      setTags([...tags, inputValue.trim()]);
      setInputValue('');
      setIsExpanded(true); 
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    const updatedTags = tags.filter((_, index) => index !== indexToRemove);
    setTags(updatedTags);
    if (updatedTags.length === 0) {
      setIsExpanded(false);
    }
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  return (
    <div className={`tag-input-container mt-4 p-8 ${isFocused || tags.length > 0 ? 'focused' : ''} ${isExpanded ? 'expanded' : ''}`}>
      <label className={`floating-label ${isFocused || tags.length > 0 ? 'active' : ''}`}>
        Tags
      </label>

      <div className="tag-list d-flex">
        {tags.map((tag, index) => (
          <div key={index} className="tag align-items-center p-1 font-14 ml-2 mt-2">
            {tag}
            <span className="tag-close ml-2 cursor-pointer" onClick={() => handleRemoveTag(index)}>
              &times;
            </span>
          </div>
        ))}
        <input
          className="tag-input-field p-1 font-14"
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          onBlur={handleInputBlur}
          onFocus={handleFocus}
        />
      </div>
    </div>
  );
};

export default TagInput;