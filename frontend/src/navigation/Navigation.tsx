import { Home, MonitorDown, Download, FileText, Image, Music, Video, HardDrive, Star, GitBranch } from 'lucide-react';
import './Navigation.css';

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

function Navigation({ currentPath, onNavigate }: NavigationProps) {
  const handleNavigate = (path: string) => {
    console.log('Navigation to:', path);
    if (path) {
      onNavigate(path);
    }
  };

  const navItems = [
    { icon: Home, label: 'ホーム', path: 'C:\\Users\\PCUSER' },
    { icon: Download, label: 'ダウンロード', path: 'C:\\Users\\PCUSER\\Downloads' },
    { icon: FileText, label: 'ドキュメント', path: 'C:\\Users\\PCUSER\\Documents' },
    { icon: Image, label: '画像', path: 'C:\\Users\\PCUSER\\Pictures' },
    { icon: Music, label: '音楽', path: 'C:\\Users\\PCUSER\\Music' },
    { icon: Video, label: 'ビデオ', path: 'C:\\Users\\PCUSER\\Videos' },
    { icon: HardDrive, label: 'PC', path: 'C:\\' },
  ];

  return (
    <div className="navigation">
      <div className="nav-section">
        <div className="nav-header">お気に入り</div>
        <div className="nav-item" onClick={() => handleNavigate('C:\\Users\\PCUSER')}>
          <Star size={16} />
          <span>スター付き</span>
        </div>
      </div>

      <div className="nav-section">
        <div className="nav-header">クイックアクセス</div>
        {navItems.map((item, index) => (
          <div
            key={index}
            className="nav-item"
            onClick={() => handleNavigate(item.path)}
          >
            <item.icon size={16} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="nav-section">
        <div className="nav-header">ソース管理</div>
        <div className="nav-item">
          <GitBranch size={16} />
          <span>変更</span>
        </div>
      </div>
    </div>
  );
}

export default Navigation;