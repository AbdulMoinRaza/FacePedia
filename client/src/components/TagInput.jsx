import React, { useState } from 'react';
import {
  Box,
  Divider,
  Typography,
  InputBase,
  useTheme,
  Button,
  IconButton,
  useMediaQuery,
} from '@mui/material';

const TagInput = ({ value, onChange }) => {
  const tagRegex = /@(\w+)/g;

  const getHighlightedText = (text) => {
    const parts = text.split(tagRegex).map((part, index) => {
      if (tagRegex.test(`@${part}`)) {
        return (
          <span key={index} style={{ color: 'blue', fontWeight: 'bold' }}>
            @{part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });

    return <>{parts}</>;
  };

  return (
    <InputBase
      contentEditable
      style={{ border: '1px solid gray', padding: '5px', minHeight: '50px' }}
      onInput={(e) => onChange(e.target.innerText)}
      dangerouslySetInnerHTML={{ __html: getHighlightedText(value) }}
    />
  );
};

export default TagInput ;