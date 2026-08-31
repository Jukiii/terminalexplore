import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import Explorer from './Explorer'
import { explorer } from '../../wailsjs/go/models'

describe('Explorer Component', () => {
  const mockFiles: explorer.FileInfo[] = [
    {
      Name: 'test.txt',
      Path: 'C:\\test.txt',
      Size: 1024,
      ModTime: '2024-01-01T00:00:00Z',
      IsDir: false,
      IsHidden: false,
      Extension: '.txt'
    },
    {
      Name: 'folder',
      Path: 'C:\\folder',
      Size: 0,
      ModTime: '2024-01-01T00:00:00Z',
      IsDir: true,
      IsHidden: false,
      Extension: ''
    }
  ]

  const mockTreeRoot: explorer.TreeNode = {
    Name: 'root',
    Path: 'C:\\',
    Size: 0,
    ModTime: '2024-01-01T00:00:00Z',
    IsDir: true,
    IsHidden: false,
    Extension: '',
    Children: [],
    IsExpanded: false,
    IsLoaded: false,
    Level: 0,
    convertValues: function(a: any, classs: any, asMap: boolean = false): any {
      return a;
    }
  }

  it('renders file count in header', () => {
    render(
      <Explorer
        files={mockFiles}
        treeRoot={mockTreeRoot}
        selectedFile={null}
        onFileSelect={vi.fn()}
        onFileDoubleClick={vi.fn()}
        onLoadChildren={vi.fn()}
        viewMode="list"
      />
    )

    expect(screen.getByText('2 ファイル')).toBeInTheDocument()
  })

  it('renders file list in list mode', () => {
    render(
      <Explorer
        files={mockFiles}
        treeRoot={mockTreeRoot}
        selectedFile={null}
        onFileSelect={vi.fn()}
        onFileDoubleClick={vi.fn()}
        onLoadChildren={vi.fn()}
        viewMode="list"
      />
    )

    expect(screen.getByText('test.txt')).toBeInTheDocument()
    expect(screen.getByText('folder')).toBeInTheDocument()
  })

  it('shows empty state when no files', () => {
    render(
      <Explorer
        files={[]}
        treeRoot={mockTreeRoot}
        selectedFile={null}
        onFileSelect={vi.fn()}
        onFileDoubleClick={vi.fn()}
        onLoadChildren={vi.fn()}
        viewMode="list"
      />
    )

    expect(screen.getByText('ファイルがありません')).toBeInTheDocument()
  })
})