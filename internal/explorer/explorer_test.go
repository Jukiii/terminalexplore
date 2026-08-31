package explorer

import (
	"os"
	"path/filepath"
	"testing"
)

func TestNewExplorer(t *testing.T) {
	exp := NewExplorer()
	if exp == nil {
		t.Fatal("NewExplorer returned nil")
	}
	if exp.currentPath != "" {
		t.Errorf("Expected empty currentPath, got %s", exp.currentPath)
	}
}

func TestSetPath(t *testing.T) {
	exp := NewExplorer()
	
	// Test with current directory
	currentDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	
	err = exp.SetPath(currentDir)
	if err != nil {
		t.Fatalf("SetPath failed: %v", err)
	}
	
	if exp.currentPath != currentDir {
		t.Errorf("Expected currentPath to be %s, got %s", currentDir, exp.currentPath)
	}
}

func TestSetPathInvalid(t *testing.T) {
	exp := NewExplorer()
	
	// Test with invalid path
	err := exp.SetPath("invalid/path/that/does/not/exist")
	if err == nil {
		t.Error("Expected error for invalid path, got nil")
	}
}

func TestGetPath(t *testing.T) {
	exp := NewExplorer()
	
	// Test with empty explorer
	path := exp.GetPath()
	if path != "" {
		t.Errorf("Expected empty path, got %s", path)
	}
	
	// Test after setting path
	currentDir, _ := os.Getwd()
	exp.SetPath(currentDir)
	path = exp.GetPath()
	if path != currentDir {
		t.Errorf("Expected %s, got %s", currentDir, path)
	}
}

func TestListFiles(t *testing.T) {
	exp := NewExplorer()
	
	// Set path to current directory
	currentDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	
	err = exp.SetPath(currentDir)
	if err != nil {
		t.Fatalf("SetPath failed: %v", err)
	}
	
	// List files
	files, err := exp.ListFiles()
	if err != nil {
		t.Fatalf("ListFiles failed: %v", err)
	}
	
	if len(files) == 0 {
		t.Error("Expected at least one file, got empty list")
	}
	
	// Verify file structure
	for _, file := range files {
		if file.Name == "" {
			t.Error("File name is empty")
		}
		if file.Path == "" {
			t.Error("File path is empty")
		}
	}
}

func TestListFilesEmptyPath(t *testing.T) {
	exp := NewExplorer()
	
	// Try to list files without setting path
	_, err := exp.ListFiles()
	if err == nil {
		t.Error("Expected error for empty path, got nil")
	}
}

func TestBuildTree(t *testing.T) {
	exp := NewExplorer()
	
	// Set path to current directory
	currentDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	
	err = exp.SetPath(currentDir)
	if err != nil {
		t.Fatalf("SetPath failed: %v", err)
	}
	
	// Build tree
	root, err := exp.BuildTree()
	if err != nil {
		t.Fatalf("BuildTree failed: %v", err)
	}
	
	if root == nil {
		t.Fatal("BuildTree returned nil")
	}
	
	if root.Name != filepath.Base(currentDir) {
		t.Errorf("Expected root name to be %s, got %s", filepath.Base(currentDir), root.Name)
	}
	
	if !root.IsDir {
		t.Error("Expected root to be a directory")
	}
}

func TestBuildTreeEmptyPath(t *testing.T) {
	exp := NewExplorer()
	
	// Try to build tree without setting path
	_, err := exp.BuildTree()
	if err == nil {
		t.Error("Expected error for empty path, got nil")
	}
}

func TestLoadChildren(t *testing.T) {
	exp := NewExplorer()
	
	// Set path to current directory
	currentDir, err := os.Getwd()
	if err != nil {
		t.Fatalf("Failed to get current directory: %v", err)
	}
	
	err = exp.SetPath(currentDir)
	if err != nil {
		t.Fatalf("SetPath failed: %v", err)
	}
	
	// Build tree first
	root, err := exp.BuildTree()
	if err != nil {
		t.Fatalf("BuildTree failed: %v", err)
	}
	
	// Load children
	err = exp.LoadChildren(root)
	if err != nil {
		t.Fatalf("LoadChildren failed: %v", err)
	}
	
	if !root.IsLoaded {
		t.Error("Expected root to be loaded")
	}
	
	if len(root.Children) == 0 {
		t.Error("Expected at least one child, got empty list")
	}
}

func TestGoUp(t *testing.T) {
	exp := NewExplorer()
	
	// Set path to a subdirectory
	testDir := filepath.Join(os.TempDir(), "test_explorer")
	os.MkdirAll(testDir, 0755)
	defer os.RemoveAll(testDir)
	
	err := exp.SetPath(testDir)
	if err != nil {
		t.Fatalf("SetPath failed: %v", err)
	}
	
	// Go up
	err = exp.GoUp()
	if err != nil {
		t.Fatalf("GoUp failed: %v", err)
	}
	
	// Verify we're in parent directory
	if exp.currentPath == testDir {
		t.Error("Expected to be in parent directory, still in test directory")
	}
}

func TestGoUpRoot(t *testing.T) {
	exp := NewExplorer()
	
	// Set path to root
	err := exp.SetPath("C:\\")
	if err != nil {
		t.Fatalf("SetPath failed: %v", err)
	}
	
	// Try to go up from root
	err = exp.GoUp()
	if err == nil {
		t.Error("Expected error when going up from root, got nil")
	}
}

func TestIsHidden(t *testing.T) {
	tests := []struct {
		name     string
		expected bool
	}{
		{".hidden", true},
		{"~file", true},
		{"normal", false},
		{"visible.txt", false},
	}
	
	for _, tt := range tests {
		result := isHidden(tt.name)
		if result != tt.expected {
			t.Errorf("isHidden(%q) = %v, expected %v", tt.name, result, tt.expected)
		}
	}
}