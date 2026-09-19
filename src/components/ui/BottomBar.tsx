import React from 'react';
import { useSky } from '../../context/SkyContext';

export const BottomBar: React.FC = () => {
  const { friendsCount, unopenedCount } = useSky();

  return (
    <div className="bottom-right-status-bar" aria-label="Sky collection status">
      <div className="status-bar-item" title="Friends Contributing">
        <span className="status-val">{friendsCount}</span>
        <span className="status-lbl">Friends</span>
      </div>

      <div className="status-bar-divider" />

      <div className="status-bar-item unopened-item" title="Unopened Items">
        <span className="status-val">{unopenedCount}</span>
        <span className="status-lbl">Unopened</span>
      </div>
    </div>
  );
};
