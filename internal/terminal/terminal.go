package terminal

import (
	"bufio"
	"context"
	"fmt"
	"io"
	"os/exec"
	"runtime"
	"strings"
	"sync"
)

// Terminal represents a terminal session
type Terminal struct {
	ID           string
	Shell        string
	WorkingDir   string
	cmd          *exec.Cmd
	stdin        io.WriteCloser
	stdout       io.Reader
	stderr       io.Reader
	ctx          context.Context
	cancel       context.CancelFunc
	outputChan   chan string
	outputBuffer []string
	mu           sync.Mutex
	isRunning    bool
}

// TerminalManager manages multiple terminal sessions
type TerminalManager struct {
	terminals map[string]*Terminal
	mu        sync.Mutex
}

// GetTerminals returns the terminals map (needed for path sync)
func (tm *TerminalManager) GetTerminals() map[string]*Terminal {
	tm.mu.Lock()
	defer tm.mu.Unlock()
	return tm.terminals
}

// NewTerminalManager creates a new TerminalManager
func NewTerminalManager() *TerminalManager {
	return &TerminalManager{
		terminals: make(map[string]*Terminal),
	}
}

// GetDefaultShell returns the default shell for the current OS
func GetDefaultShell() string {
	switch runtime.GOOS {
	case "windows":
		// Try PowerShell first, then cmd
		if _, err := exec.LookPath("powershell.exe"); err == nil {
			return "powershell.exe"
		}
		if _, err := exec.LookPath("cmd.exe"); err == nil {
			return "cmd.exe"
		}
		return "cmd.exe"
	case "darwin":
		if _, err := exec.LookPath("zsh"); err == nil {
			return "zsh"
		}
		return "bash"
	case "linux":
		if _, err := exec.LookPath("bash"); err == nil {
			return "bash"
		}
		return "sh"
	default:
		return "sh"
	}
}

// CreateTerminal creates a new terminal session
func (tm *TerminalManager) CreateTerminal(id, workingDir, shell string) (*Terminal, error) {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	if shell == "" {
		shell = GetDefaultShell()
	}

	ctx, cancel := context.WithCancel(context.Background())

	terminal := &Terminal{
		ID:         id,
		Shell:      shell,
		WorkingDir: workingDir,
		ctx:        ctx,
		cancel:     cancel,
		outputChan: make(chan string, 100),
		isRunning:  false,
	}

	// Setup command
	var cmd *exec.Cmd
	if runtime.GOOS == "windows" && strings.Contains(shell, "powershell") {
		cmd = exec.CommandContext(ctx, shell, "-NoExit", "-Command", "-")
	} else if runtime.GOOS == "windows" && strings.Contains(shell, "cmd") {
		cmd = exec.CommandContext(ctx, shell, "/k")
	} else {
		cmd = exec.CommandContext(ctx, shell)
	}

	if workingDir != "" {
		cmd.Dir = workingDir
	}

	// Setup pipes
	stdin, err := cmd.StdinPipe()
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to create stdin pipe: %w", err)
	}

	stdout, err := cmd.StdoutPipe()
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to create stdout pipe: %w", err)
	}

	stderr, err := cmd.StderrPipe()
	if err != nil {
		cancel()
		return nil, fmt.Errorf("failed to create stderr pipe: %w", err)
	}

	terminal.cmd = cmd
	terminal.stdin = stdin
	terminal.stdout = stdout
	terminal.stderr = stderr

	// Start the command
	if err := cmd.Start(); err != nil {
		cancel()
		return nil, fmt.Errorf("failed to start terminal: %w", err)
	}

	terminal.isRunning = true

	// Start reading output
	go terminal.readOutput(stdout)
	go terminal.readOutput(stderr)

	tm.terminals[id] = terminal
	return terminal, nil
}

// readOutput reads from the pipe and sends to channel
func (t *Terminal) readOutput(reader io.Reader) {
	scanner := bufio.NewScanner(reader)
	for scanner.Scan() {
		line := scanner.Text()
		t.mu.Lock()
		if t.isRunning {
			t.outputChan <- line
			t.outputBuffer = append(t.outputBuffer, line)
		}
		t.mu.Unlock()
	}

	// Send end of output signal
	t.mu.Lock()
	if t.isRunning {
		close(t.outputChan)
	}
	t.mu.Unlock()
}

// WriteInput writes input to the terminal
func (t *Terminal) WriteInput(input string) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if !t.isRunning || t.stdin == nil {
		return fmt.Errorf("terminal is not running")
	}

	_, err := t.stdin.Write([]byte(input + "\n"))
	return err
}

// GetOutput returns the output channel
func (t *Terminal) GetOutput() <-chan string {
	return t.outputChan
}

// GetLastOutput returns the accumulated output as a string
func (t *Terminal) GetLastOutput() string {
	t.mu.Lock()
	defer t.mu.Unlock()

	var output strings.Builder
	for _, line := range t.outputBuffer {
		output.WriteString(line + "\n")
	}
	return output.String()
}

// SetWorkingDir changes the working directory
func (t *Terminal) SetWorkingDir(dir string) error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if !t.isRunning {
		return fmt.Errorf("terminal is not running")
	}

	var cmd string
	if runtime.GOOS == "windows" && strings.Contains(t.Shell, "powershell") {
		cmd = fmt.Sprintf("Set-Location '%s'", dir)
	} else if runtime.GOOS == "windows" && strings.Contains(t.Shell, "cmd") {
		cmd = fmt.Sprintf("cd /d %s", dir)
	} else {
		cmd = fmt.Sprintf("cd '%s'", dir)
	}

	_, err := t.stdin.Write([]byte(cmd + "\n"))
	if err != nil {
		return err
	}

	t.WorkingDir = dir
	return nil
}

// Close closes the terminal session
func (t *Terminal) Close() error {
	t.mu.Lock()
	defer t.mu.Unlock()

	if !t.isRunning {
		return nil
	}

	t.isRunning = false
	t.cancel()
	close(t.outputChan)

	if t.stdin != nil {
		t.stdin.Close()
	}

	return nil
}

// GetTerminal returns a terminal by ID
func (tm *TerminalManager) GetTerminal(id string) (*Terminal, error) {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	terminal, exists := tm.terminals[id]
	if !exists {
		return nil, fmt.Errorf("terminal not found")
	}

	return terminal, nil
}

// CloseTerminal closes a terminal session
func (tm *TerminalManager) CloseTerminal(id string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	terminal, exists := tm.terminals[id]
	if !exists {
		return fmt.Errorf("terminal not found")
	}

	err := terminal.Close()
	delete(tm.terminals, id)
	return err
}

// CloseAll closes all terminal sessions
func (tm *TerminalManager) CloseAll() error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	var lastErr error
	for id, terminal := range tm.terminals {
		if err := terminal.Close(); err != nil {
			lastErr = err
		}
		delete(tm.terminals, id)
	}

	return lastErr
}

// UpdateTerminalPath updates the working directory for all terminals
func (tm *TerminalManager) UpdateTerminalPath(path string) error {
	tm.mu.Lock()
	defer tm.mu.Unlock()

	var lastErr error
	for _, terminal := range tm.terminals {
		if terminal.isRunning {
			if err := terminal.SetWorkingDir(path); err != nil {
				lastErr = err
			}
		}
	}

	return lastErr
}
