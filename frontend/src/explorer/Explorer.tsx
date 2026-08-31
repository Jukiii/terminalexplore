import React, { useState } from 'react';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';
import { explorer } from '../../wailsjs/go/models';
import './Explorer.css';

interface ExplorerProps {
  files: explorer.FileInfo[];
  treeRoot: explorer.TreeNode | null;
  selectedFile: explorer.FileInfo | null;
  onFileSelect: (file: explorer.FileInfo | null) => void;
  onFileDoubleClick: (file: explorer.FileInfo) => void;
  onLoadChildren: (path: string) => Promise<explorer.FileInfo[]>;
}

function Explorer({
  files,
  treeRoot,
  selectedFile,
  onFileSelect,
  onFileDoubleClick,
  onLoadChildren
}: ExplorerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('list');

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const handleNodeClick = async (node: explorer.TreeNode) => {
    onFileSelect(node);
    
    if (node.IsDir) {
      const newExpanded = new Set(expandedNodes);
      if (newExpanded.has(node.Path)) {
        newExpanded.delete(node.Path);
      } else {
        newExpanded.add(node.Path);
        if (!node.IsLoaded) {
          try {
            await onLoadChildren(node.Path);
          } catch (error) {
            console.error('Failed to load children:', error);
          }
        }
      }
      setExpandedNodes(newExpanded);
    }
  };

  const renderTreeNode = (node: explorer.TreeNode, level: number = 0): React.ReactElement => {
    const isExpanded = expandedNodes.has(node.Path);
    const isSelected = selectedFile?.Path === node.Path;
    
    console.log('Rendering tree node:', node.Name, 'at level', level, 'expanded:', isExpanded);
    
    try {
      return (
        <div key={node.Path}>
          <div
            className={`tree-node ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: `${level * 16 + 8}px`, display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '13px' }}
            onClick={() => handleNodeClick(node)}
            onDoubleClick={() => onFileDoubleClick(node)}
          >
            {node.IsDir && (
              <span style={{width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </span>
            )}
            <span style={{width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              {node.IsDir ? (
                isExpanded ? <FolderOpen size={16} /> : <Folder size={16} />
              ) : (
                <File size={16} />
              )}
            </span>
            <span style={{color: '#cccccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{node.Name}</span>
          </div>
          {isExpanded && node.Children && node.Children.length > 0 && (
            <div>
              {node.Children.map((child, index) => (
                <div key={child.Path || index}>
                  {renderTreeNode(child, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    } catch (error) {
      console.error('Error rendering tree node:', error);
      return <div key={node.Path}>Error rendering {node.Name}</div>;
    }
  };

  const renderFileList = () => {
    console.log('Rendering file list with', files.length, 'files');
    return (
      <div style={{width: '100%', height: '100%', backgroundColor: '#1e1e1e', color: '#cccccc', overflow: 'auto'}}>
        <div style={{padding: '8px 16px', backgroundColor: '#252526', borderBottom: '1px solid #3c3c3c', fontSize: '12px', fontWeight: '600', color: '#858585', display: 'flex', gap: '16px'}}>
          <span style={{flex: 1}}>名前</span>
          <span style={{width: '100px', textAlign: 'right'}}>サイズ</span>
          <span style={{width: '180px', textAlign: 'right'}}>更新日時</span>
        </div>
        <div>
          {files.map((file, index) => (
            <div
              key={file.Path}
              onClick={() => onFileSelect(file)}
              onDoubleClick={() => onFileDoubleClick(file)}
              style={{display: 'flex', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #3c3c3c', minHeight: '40px', alignItems: 'center', gap: '16px'}}
            >
              <span style={{flex: 1, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden'}}>
                {file.IsDir ? <Folder size={16} /> : <File size={16} />}
                <span style={{color: '#cccccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>{file.Name}</span>
              </span>
              <span style={{width: '100px', textAlign: 'right', color: '#cccccc'}}>
                {file.IsDir ? '' : formatFileSize(file.Size)}
              </span>
              <span style={{width: '180px', textAlign: 'right', color: '#cccccc'}}>
                {formatDate(file.ModTime)}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', color: '#cccccc', height: '100%', overflow: 'hidden'}}>
      <div style={{display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#252526', borderBottom: '1px solid #3c3c3c', gap: '8px'}}>
        <button
          onClick={() => setViewMode('tree')}
          style={{padding: '4px 12px', background: viewMode === 'tree' ? '#007acc' : 'transparent', border: '1px solid #3c3c3c', borderRadius: '4px', color: viewMode === 'tree' ? 'white' : '#cccccc', fontSize: '12px', cursor: 'pointer'}}
        >
          ツリー
        </button>
        <button
          onClick={() => setViewMode('list')}
          style={{padding: '4px 12px', background: viewMode === 'list' ? '#007acc' : 'transparent', border: '1px solid #3c3c3c', borderRadius: '4px', color: viewMode === 'list' ? 'white' : '#cccccc', fontSize: '12px', cursor: 'pointer'}}
        >
          リスト
        </button>
        <span style={{marginLeft: 'auto', fontSize: '12px', color: '#888'}}>
          {files.length} ファイル
        </span>
      </div>
      <div style={{flex: 1, overflow: 'auto', backgroundColor: '#1e1e1e'}}>
        {viewMode === 'tree' && treeRoot ? (
          <div style={{padding: '8px 0'}}>
            {renderTreeNode(treeRoot)}
          </div>
        ) : (
          renderFileList()
        )}
        {files.length === 0 && (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#858585', fontSize: '14px'}}>
            <p>ファイルがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Explorer;