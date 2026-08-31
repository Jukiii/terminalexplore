import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, ArrowUp, RefreshCw, Terminal, Layout, Settings, Check, GitBranch } from 'lucide-react';
import './Toolbar.css';

interface ToolbarProps {
  currentPath: string;
  onPathChange: (path: string) => void;
  onGoUp: () => void;
  onRefresh: () => void;
  onToggleTerminal: () => void;
  onToggleNavigation: () => void;
  terminalSync: boolean;
  onToggleTerminalSync: () => void;
  gitBranch?: string;
  isGitRepo?: boolean;
}

function Toolbar({
  currentPath,
  onPathChange,
  onGoUp,
  onRefresh,
  onToggleTerminal,
  onToggleNavigation,
  terminalSync,
  onToggleTerminalSync,
  gitBranch,
  isGitRepo
}: ToolbarProps) {
  const [pathInput, setPathInput] = useState(currentPath);

  const handlePathSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pathInput.trim()) {
      console.log('Path change requested:', pathInput.trim());
      onPathChange(pathInput.trim());
    }
  };

  const handlePathChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPathInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePathSubmit(e);
    }
  };

  // Update path input when currentPath changes
  useEffect(() => {
    setPathInput(currentPath);
  }, [currentPath]);

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <button className="toolbar-button" onClick={onGoUp} title="上へ">
          <ArrowUp size={18} />
        </button>
        <button className="toolbar-button" title="戻る">
          <ArrowLeft size={18} />
        </button>
        <button className="toolbar-button" title="進む">
          <ArrowRight size={18} />
        </button>
        <button className="toolbar-button" onClick={onRefresh} title="更新">
          <RefreshCw size={18} />
        </button>
      </div>

      <form className="toolbar-center" onSubmit={handlePathSubmit}>
        <input
          type="text"
          className="path-input"
          value={pathInput}
          onChange={handlePathChange}
          onKeyDown={handleKeyDown}
          placeholder="パスを入力..."
        />
      </form>

      <div className="toolbar-right">
        {isGitRepo && gitBranch && (
          <span style={{display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: '#888', marginRight: '8px'}}>
            <GitBranch size={14} />
            {gitBranch}
          </span>
        )}
        <button
          className={`toolbar-button ${terminalSync ? 'active' : ''}`}
          onClick={onToggleTerminalSync}
          title="ターミナル同期"
        >
          {terminalSync && <Check size={14} />}
          <Terminal size={18} />
        </button>
        <button
          className="toolbar-button"
          onClick={onToggleTerminal}
          title="ターミナル表示/非表示"
        >
          <Terminal size={18} />
        </button>
        <button
          className="toolbar-button"
          onClick={onToggleNavigation}
          title="ナビゲーション表示/非表示"
        >
          <Layout size={18} />
        </button>
        <button className="toolbar-button" title="設定">
          <Settings size={18} />
        </button>
      </div>
    </div>
  );
}

export default Toolbar;