import React, { useState } from 'react';
import { Folder, FolderOpen, File, ChevronRight, ChevronDown } from 'lucide-react';
import { explorer } from '../../wailsjs/go/models';
import ContextMenu from './ContextMenu';
import './Explorer.css';

interface ExplorerProps {
  files: explorer.FileInfo[];
  treeRoot: explorer.TreeNode | null;
  selectedFile: explorer.FileInfo | null;
  onFileSelect: (file: explorer.FileInfo | null) => void;
  onFileDoubleClick: (file: explorer.FileInfo) => void;
  onLoadChildren: (path: string) => Promise<explorer.FileInfo[]>;
  viewMode: 'tree' | 'list';
}

function Explorer({
  files,
  treeRoot,
  selectedFile,
  onFileSelect,
  onFileDoubleClick,
  onLoadChildren,
  viewMode
}: ExplorerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

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
        // Load children when expanding
        if (!node.IsLoaded) {
          try {
            const children = await onLoadChildren(node.Path);
            node.Children = (children || []).map(child => ({
              ...child,
              IsDir: child.IsDir,
              IsExpanded: false,
              IsLoaded: false,
              Level: node.Level + 1,
              Children: [],
            })) as any;
            node.IsLoaded = true;
            setExpandedNodes(new Set(newExpanded));
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
    const hasChildren = node.Children && node.Children.length > 0;
    
    console.log('Rendering tree node:', node.Name, 'at level', level, 'expanded:', isExpanded, 'children:', node.Children?.length);
    
    try {
      return (
        <div key={node.Path}>
          <div
            className={`tree-node ${isSelected ? 'selected' : ''}`}
            style={{ paddingLeft: `${level * 16 + 8}px`, display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '13px', backgroundColor: isSelected ? '#0e639c' : 'transparent' }}
            onClick={() => handleNodeClick(node)}
            onDoubleClick={() => onFileDoubleClick(node)}
            onContextMenu={(e) => {
              onFileSelect(node);
              handleContextMenu(e);
            }}
          >
            {node.IsDir && (
              <span style={{width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                {hasChildren ? (
                  isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                ) : (
                  <span style={{width: '14px'}} />
                )}
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
          {isExpanded && hasChildren && (
            <div>
              {node.Children!.map((child, index) => (
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
          {files.map((file, index) => {
            const isSelected = selectedFile?.Path === file.Path;
            return (
              <div
                key={file.Path}
                onClick={() => onFileSelect(file)}
                onDoubleClick={() => onFileDoubleClick(file)}
                onContextMenu={(e) => {
                  onFileSelect(file);
                  handleContextMenu(e);
                }}
                style={{display: 'flex', padding: '8px 16px', cursor: 'pointer', fontSize: '13px', borderBottom: '1px solid #3c3c3c', minHeight: '40px', alignItems: 'center', gap: '16px', backgroundColor: isSelected ? '#0e639c' : 'transparent'}}
              >
                <span style={{flex: 1, display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden'}}>
                  {file.IsDir ? <Folder size={16} /> : <File size={16} />}
                  <span style={{color: isSelected ? '#ffffff' : '#cccccc', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: isSelected ? '600' : 'normal'}}>{file.Name}</span>
                </span>
                <span style={{width: '100px', textAlign: 'right', color: isSelected ? '#ffffff' : '#cccccc'}}>
                  {file.IsDir ? '' : formatFileSize(file.Size)}
                </span>
                <span style={{width: '180px', textAlign: 'right', color: isSelected ? '#ffffff' : '#cccccc'}}>
                  {formatDate(file.ModTime)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!selectedFile) return;
    
    // Arrow up/down: Navigate through files
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const fileList = viewMode === 'tree' && treeRoot ? getAllNodes(treeRoot) : files;
      if (fileList.length === 0) return;
      
      const currentIndex = fileList.findIndex(f => f.Path === selectedFile.Path);
      let newIndex = currentIndex;
      
      if (e.key === 'ArrowUp') {
        newIndex = currentIndex > 0 ? currentIndex - 1 : fileList.length - 1;
      } else if (e.key === 'ArrowDown') {
        newIndex = currentIndex < fileList.length - 1 ? currentIndex + 1 : 0;
      }
      
      onFileSelect(fileList[newIndex]);
    }
    // Right arrow: Expand tree node
    else if (e.key === 'ArrowRight' && selectedFile.IsDir) {
      e.preventDefault();
      const newExpanded = new Set(expandedNodes);
      if (!newExpanded.has(selectedFile.Path)) {
        newExpanded.add(selectedFile.Path);
        setExpandedNodes(newExpanded);
      }
    }
    // Left arrow: Collapse tree node
    else if (e.key === 'ArrowLeft' && selectedFile.IsDir) {
      e.preventDefault();
      const newExpanded = new Set(expandedNodes);
      if (newExpanded.has(selectedFile.Path)) {
        newExpanded.delete(selectedFile.Path);
        setExpandedNodes(newExpanded);
      }
    }
  };

  const getAllNodes = (node: explorer.TreeNode): explorer.TreeNode[] => {
    const nodes = [node];
    if (expandedNodes.has(node.Path) && node.Children) {
      for (const child of node.Children) {
        nodes.push(...getAllNodes(child));
      }
    }
    return nodes;
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  return (
    <div style={{flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#1e1e1e', color: '#cccccc', height: '100%', overflow: 'hidden'}} onKeyDown={handleKeyDown} tabIndex={0}>
      <div style={{display: 'flex', alignItems: 'center', padding: '8px 16px', backgroundColor: '#252526', borderBottom: '1px solid #3c3c3c', gap: '8px'}}>
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
        {viewMode === 'list' && files.length === 0 && (
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#858585', fontSize: '14px'}}>
            <p>ファイルがありません</p>
          </div>
        )}
      </div>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          file={selectedFile}
          onClose={() => setContextMenu(null)}
          onRefresh={() => {
            // This will trigger a refresh of files
            console.log('Refresh requested from context menu');
          }}
        />
      )}
    </div>
  );
}

export default Explorer;