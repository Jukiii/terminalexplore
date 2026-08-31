import { useState } from 'react';
import { X } from 'lucide-react';
import './Settings.css';

interface SettingsProps {
  onClose: () => void;
  terminalSync: boolean;
  onToggleTerminalSync: () => void;
}

function Settings({ onClose, terminalSync, onToggleTerminalSync }: SettingsProps) {
  const [selectedTab, setSelectedTab] = useState('general');

  return (
    <div className="settings-overlay">
      <div className="settings-panel">
        <div className="settings-header">
          <h2>設定</h2>
          <button className="settings-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="settings-tabs">
          <button
            className={`settings-tab ${selectedTab === 'general' ? 'active' : ''}`}
            onClick={() => setSelectedTab('general')}
          >
            一般
          </button>
          <button
            className={`settings-tab ${selectedTab === 'terminal' ? 'active' : ''}`}
            onClick={() => setSelectedTab('terminal')}
          >
            ターミナル
          </button>
          <button
            className={`settings-tab ${selectedTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setSelectedTab('appearance')}
          >
            外観
          </button>
        </div>

        <div className="settings-content">
          {selectedTab === 'general' && (
            <div className="settings-section">
              <h3>一般設定</h3>
              <p className="settings-description">アプリケーションの基本設定です</p>
            </div>
          )}

          {selectedTab === 'terminal' && (
            <div className="settings-section">
              <h3>ターミナル設定</h3>
              <div className="settings-group">
                <label className="settings-label">
                  <input
                    type="checkbox"
                    checked={terminalSync}
                    onChange={onToggleTerminalSync}
                  />
                  <span>ターミナルをパス変更と同期</span>
                </label>
                <p className="settings-description">
                  エクスプローラーでディレクトリを変更するとターミナルも同じディレクトリに移動します
                </p>
              </div>
            </div>
          )}

          {selectedTab === 'appearance' && (
            <div className="settings-section">
              <h3>外観設定</h3>
              <p className="settings-description">今後実装予定</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Settings;
