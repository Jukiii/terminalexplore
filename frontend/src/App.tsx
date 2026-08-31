import { useState, useEffect, useCallback } from 'react';
import './App.css';
import { SetPath, GetPath, ListFiles, BuildTree, LoadChildren, GoUp, CreateTerminal, CloseTerminal, WriteTerminalInput, SetTerminalSync, GetTerminalSync, IsGitRepository, GetGitStatus, GetCurrentBranch, GetGitBranches } from '../wailsjs/go/main/App';
import { explorer } from '../wailsjs/go/models';
import Toolbar from './toolbar/Toolbar';
import Navigation from './navigation/Navigation';
import Explorer from './explorer/Explorer';
import Terminal from './terminal/Terminal';

function App() {
  const [currentPath, setCurrentPath] = useState('');
  const [files, setFiles] = useState<explorer.FileInfo[]>([]);
  const [treeRoot, setTreeRoot] = useState<explorer.TreeNode | null>(null);
  const [selectedFile, setSelectedFile] = useState<explorer.FileInfo | null>(null);
  const [terminalVisible, setTerminalVisible] = useState(true);
  const [terminalSync, setTerminalSync] = useState(true);
  const [activeTerminal, setActiveTerminal] = useState('1');
  const [navigationVisible, setNavigationVisible] = useState(false);
  const [isGitRepo, setIsGitRepo] = useState(false);
  const [gitBranch, setGitBranch] = useState('');
  const [gitStatus, setGitStatus] = useState('');

  useEffect(() => {
    // Initialize with current directory
    loadCurrentPath();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl + ` or Ctrl + J: Toggle terminal
      if ((e.ctrlKey && e.key === '`') || (e.ctrlKey && e.key === 'j')) {
        e.preventDefault();
        setTerminalVisible(!terminalVisible);
      }
      // Ctrl + T: New explorer tab (not implemented yet)
      else if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        console.log('New tab (not implemented)');
      }
      // Ctrl + W: Close tab (not implemented yet)
      else if (e.ctrlKey && e.key === 'w') {
        e.preventDefault();
        console.log('Close tab (not implemented)');
      }
      // Ctrl + L: Focus address bar
      else if (e.ctrlKey && e.key === 'l') {
        e.preventDefault();
        const addressInput = document.querySelector('.path-input') as HTMLInputElement;
        if (addressInput) {
          addressInput.focus();
          addressInput.select();
        }
      }
      // F2: Rename (not implemented yet)
      else if (e.key === 'F2') {
        e.preventDefault();
        console.log('Rename (not implemented)');
      }
      // Delete: Delete (not implemented yet)
      else if (e.key === 'Delete') {
        e.preventDefault();
        console.log('Delete (not implemented)');
      }
      // F5: Refresh
      else if (e.key === 'F5') {
        e.preventDefault();
        handleRefresh();
      }
      // Alt + Up: Go to parent directory
      else if (e.altKey && e.key === 'ArrowUp') {
        e.preventDefault();
        handleGoUp();
      }
      // Alt + Left: Go back (not implemented yet)
      else if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        console.log('Go back (not implemented)');
      }
      // Alt + Right: Go forward (not implemented yet)
      else if (e.altKey && e.key === 'ArrowRight') {
        e.preventDefault();
        console.log('Go forward (not implemented)');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [terminalVisible]);

  const loadCurrentPath = async () => {
    try {
      const path = await GetPath();
      console.log('Current path:', path);
      setCurrentPath(path || '');
      await loadFiles();
      await loadTree();
      await checkGitStatus();
    } catch (error) {
      console.error('Failed to load current path:', error);
      // Fallback to home directory
      const homeDir = "C:\\Users\\PCUSER";
      await handlePathChange(homeDir);
    }
  };

  // Add debug log to see if component renders
  console.log('App render - files:', files.length, 'path:', currentPath);

  const loadFiles = async () => {
    try {
      const fileList = await ListFiles();
      console.log('Loaded files:', fileList);
      setFiles(fileList || []);
    } catch (error) {
      console.error('Failed to load files:', error);
      setFiles([]);
    }
  };

  const loadTree = async () => {
    try {
      const root = await BuildTree();
      console.log('Tree root:', root);
      setTreeRoot(root);
    } catch (error) {
      console.error('Failed to load tree:', error);
    }
  };

  const handlePathChange = async (newPath: string) => {
    try {
      await SetPath(newPath);
      setCurrentPath(newPath);
      await loadFiles();
      await loadTree();
      await checkGitStatus();
    } catch (error) {
      console.error('Failed to change path:', error);
    }
  };

  const handleFileDoubleClick = async (file: explorer.FileInfo) => {
    if (file.IsDir) {
      await handlePathChange(file.Path);
    }
  };

  const handleGoUp = async () => {
    try {
      await GoUp();
      const newPath = await GetPath();
      setCurrentPath(newPath || '');
      await loadFiles();
      await loadTree();
      await checkGitStatus();
    } catch (error) {
      console.error('Failed to go up:', error);
    }
  };

  const handleToggleTerminal = useCallback(() => {
    setTerminalVisible(!terminalVisible);
  }, [terminalVisible]);

  const handleToggleNavigation = useCallback(() => {
    setNavigationVisible(!navigationVisible);
  }, [navigationVisible]);

  const handleToggleTerminalSync = async () => {
    const newSync = !terminalSync;
    setTerminalSync(newSync);
    await SetTerminalSync(newSync);
  };

  const handleRefresh = async () => {
    await loadFiles();
    await loadTree();
    await checkGitStatus();
  };

  const checkGitStatus = async () => {
    try {
      const isRepo = await IsGitRepository(currentPath);
      setIsGitRepo(isRepo);
      
      if (isRepo) {
        const branch = await GetCurrentBranch(currentPath);
        setGitBranch(branch || '');
        
        const status = await GetGitStatus(currentPath);
        setGitStatus(status || '');
      } else {
        setGitBranch('');
        setGitStatus('');
      }
    } catch (error) {
      console.error('Failed to check git status:', error);
      setIsGitRepo(false);
      setGitBranch('');
      setGitStatus('');
    }
  };

  return (
    <div className="app" style={{display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#1e1e1e', color: '#cccccc', overflow: 'hidden'}}>
      <Toolbar
        currentPath={currentPath}
        onPathChange={handlePathChange}
        onGoUp={handleGoUp}
        onRefresh={handleRefresh}
        onToggleTerminal={handleToggleTerminal}
        onToggleNavigation={handleToggleNavigation}
        terminalSync={terminalSync}
        onToggleTerminalSync={handleToggleTerminalSync}
        gitBranch={gitBranch}
        isGitRepo={isGitRepo}
      />
      <div className="main-content" style={{display: 'flex', flex: 1, overflow: 'hidden', minHeight: 0}}>
        {navigationVisible && (
          <Navigation
            currentPath={currentPath}
            onNavigate={handlePathChange}
          />
        )}
        <Explorer
          files={files}
          treeRoot={treeRoot}
          selectedFile={selectedFile}
          onFileSelect={setSelectedFile}
          onFileDoubleClick={handleFileDoubleClick}
          onLoadChildren={LoadChildren}
        />
      </div>
      {terminalVisible && (
        <Terminal
          id={activeTerminal}
          currentPath={currentPath}
          sync={terminalSync}
          onCreateTerminal={CreateTerminal}
          onCloseTerminal={CloseTerminal}
          onWriteInput={WriteTerminalInput}
        />
      )}
    </div>
  );
}

export default App;