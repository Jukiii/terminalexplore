package git

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// GitService handles Git operations
type GitService struct {
	gitPath string
}

// NewGitService creates a new GitService
func NewGitService() *GitService {
	gitPath, _ := exec.LookPath("git")
	return &GitService{
		gitPath: gitPath,
	}
}

// IsGitRepository checks if the given path is a Git repository
func (g *GitService) IsGitRepository(path string) bool {
	if g.gitPath == "" {
		return false
	}

	gitDir := filepath.Join(path, ".git")
	if _, err := os.Stat(gitDir); err == nil {
		return true
	}

	// Check parent directories
	parent := filepath.Dir(path)
	for parent != path {
		gitDir = filepath.Join(parent, ".git")
		if _, err := os.Stat(gitDir); err == nil {
			return true
		}
		path = parent
		parent = filepath.Dir(path)
	}

	return false
}

// GetStatus returns the Git status of the repository
func (g *GitService) GetStatus(path string) (string, error) {
	if g.gitPath == "" {
		return "", fmt.Errorf("git not found")
	}

	if !g.IsGitRepository(path) {
		return "", fmt.Errorf("not a git repository")
	}

	cmd := exec.Command(g.gitPath, "status", "--short")
	cmd.Dir = path

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("git status failed: %w", err)
	}

	return string(output), nil
}

// GetCurrentBranch returns the current branch name
func (g *GitService) GetCurrentBranch(path string) (string, error) {
	if g.gitPath == "" {
		return "", fmt.Errorf("git not found")
	}

	if !g.IsGitRepository(path) {
		return "", fmt.Errorf("not a git repository")
	}

	cmd := exec.Command(g.gitPath, "branch", "--show-current")
	cmd.Dir = path

	output, err := cmd.Output()
	if err != nil {
		return "", fmt.Errorf("git branch failed: %w", err)
	}

	return strings.TrimSpace(string(output)), nil
}

// GetBranches returns all branches
func (g *GitService) GetBranches(path string) ([]string, error) {
	if g.gitPath == "" {
		return nil, fmt.Errorf("git not found")
	}

	if !g.IsGitRepository(path) {
		return nil, fmt.Errorf("not a git repository")
	}

	cmd := exec.Command(g.gitPath, "branch", "--format=%(refname:short)")
	cmd.Dir = path

	output, err := cmd.Output()
	if err != nil {
		return nil, fmt.Errorf("git branch failed: %w", err)
	}

	branches := strings.Split(strings.TrimSpace(string(output)), "\n")
	if len(branches) == 1 && branches[0] == "" {
		return []string{}, nil
	}

	return branches, nil
}

// Add adds files to the staging area
func (g *GitService) Add(path string, files []string) error {
	if g.gitPath == "" {
		return fmt.Errorf("git not found")
	}

	if !g.IsGitRepository(path) {
		return fmt.Errorf("not a git repository")
	}

	args := []string{"add"}
	args = append(args, files...)

	cmd := exec.Command(g.gitPath, args...)
	cmd.Dir = path

	return cmd.Run()
}

// Commit creates a new commit
func (g *GitService) Commit(path string, message string) error {
	if g.gitPath == "" {
		return fmt.Errorf("git not found")
	}

	if !g.IsGitRepository(path) {
		return fmt.Errorf("not a git repository")
	}

	cmd := exec.Command(g.gitPath, "commit", "-m", message)
	cmd.Dir = path

	return cmd.Run()
}