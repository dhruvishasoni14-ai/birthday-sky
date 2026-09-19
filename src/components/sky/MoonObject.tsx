import React from 'react';
import { useSky } from '../../context/SkyContext';
import { CodeMoon } from './CodeMoon';

export const MoonObject: React.FC = () => {
  const { openMoon, isMoonOpened } = useSky();

  return (
    <div
      className="moon-wrapper simple-moon-interactive"
      style={{
        position: 'absolute',
        left: '52%',
        top: '18%',
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        zIndex: 20
      }}
      onClick={(e) => {
        e.stopPropagation();
        openMoon();
      }}
      title="The Moon"
    >
      <CodeMoon size={155} unopened={!isMoonOpened} />
    </div>
  );
};
