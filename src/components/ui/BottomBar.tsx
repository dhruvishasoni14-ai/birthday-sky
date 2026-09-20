import React from 'react';
import { RefreshCw } from 'lucide-react';
import { useSky } from '../../context/SkyContext';

export const BottomBar: React.FC = () => {
  const { friendsCount, unopenedCount, currentUser, refreshProgress } = useSky();

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
        {currentUser && (
          <button type="button" className="progress-refresh-btn" onClick={() => void refreshProgress()} title="Refresh your opened progress" aria-label="Refresh opened progress">
            <RefreshCw size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
