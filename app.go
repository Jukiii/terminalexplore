package main

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"terminalexplorer/internal/explorer"
	"terminalexplorer/internal/git"
	"terminalexplorer/internal/terminal"
)

// App struct
type App struct {
	ctx          context.Context
	explorer     *explorer.Explorer
	terminalMgr  *terminal.TerminalManager
	gitService   *git.GitService
	terminalSync bool
	currentPath  string
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{
		gitService:   git.NewGitService(),
		terminalSync: true,
	}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
	a.explorer = explorer.NewExplorer()
	a.terminalMgr = terminal.NewTerminalManager()

	// Set initial path to current directory
	currentDir, err := os.Getwd()
	if err != nil {
		currentDir = "C:\\"
	}
	// Set the path and ensure it's set in currentPath
	if err := a.SetPath(currentDir); err != nil {
		fmt.Printf("Error setting initial path: %v\n", err)
		a.currentPath = currentDir
	}
}

// SetPath sets the current path for both explorer and terminal
func (a *App) SetPath(path string) error {
	absPath, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	// Set explorer path
	if err := a.explorer.SetPath(absPath); err != nil {
		return err
	}

	a.currentPath = absPath

	// Sync terminal if enabled
	if a.terminalSync {
		// Update all running terminals' working directory
		a.terminalMgr.UpdateTerminalPath(absPath)
	}

	return nil
}

// GetPath returns the current path
func (a *App) GetPath() string {
	if a.currentPath == "" {
		// Fallback to current working directory
		if wd, err := os.Getwd(); err == nil {
			a.currentPath = wd
		} else {
			a.currentPath = "C:\\"
		}
	}
	return a.currentPath
}

// ListFiles returns files in the current directory
func (a *App) ListFiles() ([]explorer.FileInfo, error) {
	if a.currentPath == "" {
		return []explorer.FileInfo{}, nil
	}
	return a.explorer.ListFiles()
}

// BuildTree builds the file tree structure
func (a *App) BuildTree() (*explorer.TreeNode, error) {
	return a.explorer.BuildTree()
}

// LoadChildren loads children for a tree node
func (a *App) LoadChildren(path string) ([]explorer.FileInfo, error) {
	node := &explorer.TreeNode{}
	node.Path = path
	node.IsDir = true
	if err := a.explorer.LoadChildren(node); err != nil {
		return nil, err
	}

	var files []explorer.FileInfo
	for _, child := range node.Children {
		files = append(files, child.FileInfo)
	}
	return files, nil
}

// GoUp moves to parent directory
func (a *App) GoUp() error {
	return a.explorer.GoUp()
}

// CreateTerminal creates a new terminal session
func (a *App) CreateTerminal(id string) error {
	if a.currentPath == "" {
		// Use current working directory as fallback
		if wd, err := os.Getwd(); err == nil {
			a.currentPath = wd
		} else {
			a.currentPath = "C:\\"
		}
	}
	_, err := a.terminalMgr.CreateTerminal(id, a.currentPath, "")
	if err != nil {
		fmt.Printf("Failed to create terminal %s: %v\n", id, err)
	}
	return err
}

// CloseTerminal closes a terminal session
func (a *App) CloseTerminal(id string) error {
	return a.terminalMgr.CloseTerminal(id)
}

// WriteTerminalInput writes input to a terminal
func (a *App) WriteTerminalInput(id, input string) error {
	term, err := a.terminalMgr.GetTerminal(id)
	if err != nil {
		return err
	}
	return term.WriteInput(input)
}

// GetTerminalOutput returns the output channel for a terminal
func (a *App) GetTerminalOutput(id string) (<-chan string, error) {
	term, err := a.terminalMgr.GetTerminal(id)
	if err != nil {
		return nil, err
	}
	return term.GetOutput(), nil
}

// SetTerminalSync enables/disables terminal sync
func (a *App) SetTerminalSync(enabled bool) {
	a.terminalSync = enabled
}

// GetTerminalSync returns terminal sync status
func (a *App) GetTerminalSync() bool {
	return a.terminalSync
}

// Git methods
func (a *App) IsGitRepository(path string) bool {
	return a.gitService.IsGitRepository(path)
}

func (a *App) GetGitStatus(path string) (string, error) {
	return a.gitService.GetStatus(path)
}

func (a *App) GetCurrentBranch(path string) (string, error) {
	return a.gitService.GetCurrentBranch(path)
}

func (a *App) GetGitBranches(path string) ([]string, error) {
	return a.gitService.GetBranches(path)
}

// Greet returns a greeting for the given name (kept for compatibility)
func (a *App) Greet(name string) string {
	return fmt.Sprintf("Hello %s, It's show time!", name)
}
