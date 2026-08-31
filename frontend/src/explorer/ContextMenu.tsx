import React, { useEffect } from 'react';
import { Copy, Scissors, Trash2, RefreshCw, Play, Archive, ArrowUpRight } from 'lucide-react';
import { explorer } from '../../wailsjs/go/models';
import './ContextMenu.css';

interface ContextMenuProps {
  x: number;
  y: number;
  file: explorer.FileInfo | null;
  onClose: () => void;
  onRefresh: () => void;
}

function ContextMenu({ x, y, file, onClose, onRefresh }: ContextMenuProps) {
  useEffect(() => {
    const handleClickOutside = () => onClose();
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file) {
      // Copy file path to clipboard
      navigator.clipboard.writeText(file.Path);
    }
    onClose();
  };

  const handleCut = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file) {
      // Copy file path to clipboard with cut indicator
      navigator.clipboard.writeText(`CUT:${file.Path}`);
    }
    onClose();
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file) {
      const confirmDelete = window.confirm(
        `本当に削除しますか？\n${file.Name}`
      );
      if (confirmDelete) {
        console.log('Delete:', file.Path);
        // TODO: Implement actual delete
        onRefresh();
      }
    }
    onClose();
  };

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file && !file.IsDir) {
      console.log('Execute:', file.Path);
      // TODO: Implement execution via Go backend
      alert('実行機能は準備中です');
    }
    onClose();
  };

  const handleCompress = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file) {
      const zipName = file.IsDir ? `${file.Name}.zip` : `${file.Name.split('.')[0]}.zip`;
      console.log('Compress:', file.Path, 'to', zipName);
      alert(`圧縮機能は準備中です\n${file.Name} → ${zipName}`);
    }
    onClose();
  };

  const handleOpenWith = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (file) {
      console.log('Open with default app:', file.Path);
      alert(`次のアプリで開く機能は準備中です\n${file.Name}`);
    }
    onClose();
  };

  const handleRefreshMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRefresh();
    onClose();
  };

  return (
    <div
      className="context-menu"
      style={{
        top: `${y}px`,
        left: `${x}px`,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {file ? (
        <>
          {!file.IsDir && (
            <>
              <button className="context-menu-item" onClick={handleExecute}>
                <Play size={14} />
                <span>実行</span>
              </button>
              <div className="context-menu-separator"></div>
            </>
          )}
          <button className="context-menu-item" onClick={handleCopy}>
            <Copy size={14} />
            <span>コピー</span>
          </button>
          <button className="context-menu-item" onClick={handleCut}>
            <Scissors size={14} />
            <span>切り取り</span>
          </button>
          <div className="context-menu-separator"></div>
          <button className="context-menu-item" onClick={handleCompress}>
            <Archive size={14} />
            <span>圧縮 (ZIP)</span>
          </button>
          <button className="context-menu-item" onClick={handleOpenWith}>
            <ArrowUpRight size={14} />
            <span>次のアプリで開く</span>
          </button>
          <div className="context-menu-separator"></div>
          <button className="context-menu-item danger" onClick={handleDelete}>
            <Trash2 size={14} />
            <span>削除</span>
          </button>
          <div className="context-menu-separator"></div>
        </>
      ) : null}
      <button className="context-menu-item" onClick={handleRefreshMenu}>
        <RefreshCw size={14} />
        <span>更新</span>
      </button>
    </div>
  );
}

export default ContextMenu;
