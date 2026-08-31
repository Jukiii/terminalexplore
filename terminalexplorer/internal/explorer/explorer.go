package explorer

import (
	"os"
	"path/filepath"
	"time"
)

// FileInfo represents file information
type FileInfo struct {
	Name      string
	Path      string
	Size      int64
	ModTime   string
	IsDir     bool
	IsHidden  bool
	Extension string
}

// TreeNode represents a node in the file tree
type TreeNode struct {
	FileInfo
	Children   []*TreeNode
	IsExpanded bool
	IsLoaded   bool
	Parent     *TreeNode
	Level      int
}

// Explorer manages file system operations
type Explorer struct {
	currentPath string
	rootNode    *TreeNode
}

// NewExplorer creates a new Explorer instance
func NewExplorer() *Explorer {
	return &Explorer{}
}

// SetPath sets the current path
func (e *Explorer) SetPath(path string) error {
	if !filepath.IsAbs(path) {
		return os.ErrInvalid
	}

	absPath, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	info, err := os.Stat(absPath)
	if err != nil {
		return err
	}

	if !info.IsDir() {
		return os.ErrInvalid
	}

	e.currentPath = absPath
	return nil
}

// GetPath returns the current path
func (e *Explorer) GetPath() string {
	return e.currentPath
}

// ListFiles returns files in the current directory
func (e *Explorer) ListFiles() ([]FileInfo, error) {
	if e.currentPath == "" {
		return nil, os.ErrInvalid
	}

	entries, err := os.ReadDir(e.currentPath)
	if err != nil {
		return nil, err
	}

	var files []FileInfo
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		path := filepath.Join(e.currentPath, entry.Name())
		fileInfo := FileInfo{
			Name:      entry.Name(),
			Path:      path,
			Size:      info.Size(),
			ModTime:   info.ModTime().Format(time.RFC3339),
			IsDir:     entry.IsDir(),
			IsHidden:  isHidden(entry.Name()),
			Extension: filepath.Ext(entry.Name()),
		}

		files = append(files, fileInfo)
	}

	return files, nil
}

// BuildTree builds the file tree structure
func (e *Explorer) BuildTree() (*TreeNode, error) {
	if e.currentPath == "" {
		return nil, os.ErrInvalid
	}

	root := &TreeNode{
		FileInfo: FileInfo{
			Name:     filepath.Base(e.currentPath),
			Path:     e.currentPath,
			ModTime:  time.Now().Format(time.RFC3339),
			IsDir:    true,
			IsHidden: false,
		},
		IsExpanded: true,
		IsLoaded:   false,
		Level:      0,
	}

	e.rootNode = root
	return root, nil
}

// LoadChildren loads children for a tree node
func (e *Explorer) LoadChildren(node *TreeNode) error {
	if node == nil || !node.IsDir {
		return nil
	}

	entries, err := os.ReadDir(node.Path)
	if err != nil {
		return err
	}

	var children []*TreeNode
	for _, entry := range entries {
		info, err := entry.Info()
		if err != nil {
			continue
		}

		path := filepath.Join(node.Path, entry.Name())
		child := &TreeNode{
			FileInfo: FileInfo{
				Name:      entry.Name(),
				Path:      path,
				Size:      info.Size(),
				ModTime:   info.ModTime().Format(time.RFC3339),
				IsDir:     entry.IsDir(),
				IsHidden:  isHidden(entry.Name()),
				Extension: filepath.Ext(entry.Name()),
			},
			Parent:   node,
			Level:    node.Level + 1,
			IsLoaded: false,
		}

		children = append(children, child)
	}

	node.Children = children
	node.IsLoaded = true
	return nil
}

// isHidden checks if a file/directory is hidden
func isHidden(name string) bool {
	if len(name) == 0 {
		return false
	}
	return name[0] == '.' || name[0] == '~'
}

// GoUp moves to parent directory
func (e *Explorer) GoUp() error {
	if e.currentPath == "" {
		return os.ErrInvalid
	}

	parent := filepath.Dir(e.currentPath)
	if parent == e.currentPath {
		return os.ErrInvalid
	}

	return e.SetPath(parent)
}
