import { useState, useEffect, useRef } from 'react';
import { X, Plus, Terminal as TerminalIcon } from 'lucide-react';
import './Terminal.css';

interface TerminalProps {
  id: string;
  currentPath: string;
  sync: boolean;
  onCreateTerminal: (id: string) => Promise<void>;
  onCloseTerminal: (id: string) => Promise<void>;
  onWriteInput: (id: string, input: string) => Promise<void>;
  onGetOutput?: (id: string) => Promise<string[]>;
}

function Terminal({
  id,
  currentPath,
  sync,
  onCreateTerminal,
  onCloseTerminal,
  onWriteInput,
  onGetOutput
}: TerminalProps) {
  const [terminals, setTerminals] = useState<string[]>(['1']);
  const [activeTerminal, setActiveTerminal] = useState('1');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string[]>([]);
  const [height, setHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const terminalRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize first terminal
    const initTerminal = async () => {
      try {
        await onCreateTerminal('1');
        console.log('Terminal initialized');
      } catch (error) {
        console.error('Failed to initialize terminal:', error);
        // Add welcome message even if terminal fails
        setOutput([
          'Windows PowerShell',
          'Copyright (C) Microsoft Corporation. All rights reserved.',
          '新しいクロスプラットフォーム PowerShell を試してください https://aka.ms/pscore6',
          '',
          `${currentPath}>`
        ]);
      }
    };
    initTerminal();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when output changes
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const handleCreateTerminal = async () => {
    const newId = (terminals.length + 1).toString();
    try {
      await onCreateTerminal(newId);
      setTerminals([...terminals, newId]);
      setActiveTerminal(newId);
      console.log('Terminal created:', newId);
    } catch (error) {
      console.error('Failed to create terminal:', error);
      // Don't add terminal if creation failed
    }
  };

  const handleCloseTerminal = async (terminalId: string) => {
    if (terminals.length === 1) {
      // Don't close the last terminal, just clear it
      setOutput([
        'Windows PowerShell',
        'Copyright (C) Microsoft Corporation. All rights reserved.',
        '新しいクロスプラットフォーム PowerShell を試してください https://aka.ms/pscore6',
        '',
        `${currentPath}>`
      ]);
      setInput('');
      return;
    }
    
    try {
      await onCloseTerminal(terminalId);
      const newTerminals = terminals.filter(t => t !== terminalId);
      setTerminals(newTerminals);
      if (activeTerminal === terminalId) {
        setActiveTerminal(newTerminals[0]);
      }
    } catch (error) {
      console.error('Failed to close terminal:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      // Add command to output
      setOutput([...output, `${currentPath}> ${input}`]);
      
      // Execute command (simplified for now)
      try {
        await onWriteInput(activeTerminal, input);
        // Simulate command output
        setTimeout(() => {
          setOutput(prev => [...prev, `Command executed: ${input}`]);
        }, 500);
      } catch (writeError) {
        console.error('Failed to write to terminal:', writeError);
        setOutput(prev => [...prev, `Error: ${writeError}`]);
      }
      
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleInputSubmit(e);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && terminalRef.current) {
        const rect = terminalRef.current.getBoundingClientRect();
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 100 && newHeight <= 500) {
          setHeight(newHeight);
        }
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  return (
    <div
      ref={terminalRef}
      className="terminal"
      style={{ height: `${height}px` }}
    >
      <div className="terminal-header">
        <div className="terminal-tabs">
          {terminals.map((terminalId) => (
            <div
              key={terminalId}
              className={`terminal-tab ${activeTerminal === terminalId ? 'active' : ''}`}
              onClick={() => setActiveTerminal(terminalId)}
            >
              <TerminalIcon size={14} />
              <span>PowerShell {terminalId}</span>
              <button
                className="terminal-tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCloseTerminal(terminalId);
                }}
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <button
            className="terminal-tab-add"
            onClick={handleCreateTerminal}
            title="新しいターミナル"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>
      <div className="terminal-body">
        <div ref={outputRef} className="terminal-output">
          {output.map((line, index) => (
            <div key={index} className="terminal-output-line">
              {line}
            </div>
          ))}
        </div>
        <form className="terminal-input" onSubmit={handleInputSubmit}>
          <span className="terminal-prompt">{currentPath}&gt;</span>
          <input
            type="text"
            className="terminal-input-field"
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="コマンドを入力..."
          />
        </form>
      </div>
      <div
        className="terminal-resize-handle"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
}

export default Terminal;