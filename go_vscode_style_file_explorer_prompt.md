# Go製・VS Code風ファイルエクスプローラー開発プロンプト

あなたはシニアGoエンジニア、UI/UXエンジニア、デスクトップアプリ開発者です。

Windows ExplorerとVS Codeの操作性を融合した、**高機能なマルチプラットフォーム対応ファイルエクスプローラー**をGoで開発してください。

単なるファイル一覧アプリではなく、**「VS Codeのエクスプローラー＋統合ターミナル＋Git機能を独立したファイルマネージャーにしたもの」**を目標とします。

---

# 1. 対応OS

以下のOSに対応してください。

- Windows
- macOS
- Linux

特にWindowsを最優先として開発してください。

OS固有の処理はインターフェースで抽象化し、可能な限り共通コードを使用してください。

---

# 2. 技術スタック

基本言語：

- Go

GUI：

- Wails + React + TypeScriptを第一候補とする
- 必要に応じて別のGo対応GUIフレームワークを提案してよい

ターミナル：

- Windows：ConPTY
- macOS/Linux：PTY

ファイル監視：

- fsnotify

Git：

- Git CLIを利用する方式を第一候補とする
- 必要に応じてgo-gitなどのGoライブラリを検討する
- Gitがインストールされていない環境でもExplorer自体は正常動作するようにする

アイコン：

- Lucide Icons

UIはVS Codeを参考にし、ダークテーマとライトテーマの両方に対応してください。

---

# 3. 基本コンセプト

以下のようなアプリケーションを作成してください。

```text
┌──────────────────────────────────────────────────────────────┐
│ ← → ↑  ↻  │ C:\Users\User\Projects       │ 🔍 Search        │
├───────────────┬──────────────────────────────────────────────┤
│               │                                              │
│ Navigation    │              File Explorer                    │
│               │                                              │
│ ★ Favorites   │  📁 src                                      │
│ 🏠 Home       │  📁 assets                                   │
│ Desktop       │  📄 main.go                                  │
│ Downloads     │  📄 README.md                                │
│ Documents     │                                              │
│               │                                              │
│ Source Ctrl   │                                              │
│  Git          │                                              │
│               │                                              │
├───────────────┴──────────────────────────────────────────────┤
│ PowerShell 1 │ PowerShell 2 │ +                             │
├──────────────────────────────────────────────────────────────┤
│ PS C:\Users\User\Projects>                                  │
│ >                                                           │
└──────────────────────────────────────────────────────────────┘
```

---

# 4. エクスプローラー

Windows Explorerのようなファイル操作を実装してください。

対応：

- ファイル表示
- フォルダ表示
- ファイルサイズ
- 更新日時
- ファイル種類
- 隠しファイル
- 拡張子
- ソート
- 複数選択
- ドラッグ＆ドロップ

表示モード：

- 詳細表示
- 一覧表示
- アイコン表示
- 大アイコン表示

---

# 5. Tree表示

このアプリの重要機能です。

VS CodeのExplorerのように、

**フォルダの中へ移動せず、その場で下の階層を展開できるTree UI**

を実装してください。

例：

```text
📁 Project
 ├─ 📁 src
 │   ├─ 📁 components
 │   │   ├─ 📄 Button.tsx
 │   │   └─ 📄 Header.tsx
 │   ├─ 📄 main.ts
 │   └─ 📄 app.ts
 ├─ 📁 assets
 ├─ 📄 package.json
 └─ 📄 README.md
```

キーボード操作：

- `→` ：選択中のフォルダを展開
- `←` ：フォルダを閉じる
- `Enter` ：ファイルを開く / フォルダへ移動
- `Space` ：選択
- `F2` ：名前変更
- `Delete` ：削除

フォルダを展開しても、現在のパスは必要に応じて維持してください。

大量のファイルでも動作するよう、

- Lazy Loading
- Virtual Scrolling
- 非同期読み込み

を使用してください。

---

# 6. ナビゲーションウィンドウ

左側にナビゲーションウィンドウを配置してください。

項目：

- Home
- Desktop
- Downloads
- Documents
- Pictures
- Music
- Videos
- PC
- 各ドライブ
- 外部ストレージ
- Favorites
- Git関連ビュー

Favoritesには任意のフォルダを登録できるようにしてください。

ドラッグ＆ドロップによる並び替えにも対応してください。

ナビゲーションウィンドウ自体も、

- 表示/非表示
- 幅変更

に対応してください。

---

# 7. ツールバー

上部にツールバーを配置してください。

ボタン：

- 戻る
- 進む
- 上へ
- 更新
- 新規フォルダ
- コピー
- 切り取り
- 貼り付け
- 削除
- Git操作

アドレスバー：

```text
C:\Users\User\Projects
```

を直接入力して移動できるようにしてください。

`Ctrl + L` でアドレスバーへフォーカスしてください。

可能であればBreadcrumbにも対応してください。

```text
C: > Users > User > Projects
```

---

# 8. 検索

ファイル検索機能を実装してください。

検索対象：

- ファイル名
- フォルダ名
- 拡張子

部分一致に対応してください。

大量のファイルを検索してもUIが固まらないようにしてください。

検索処理は非同期にし、キャンセル可能にしてください。

---

# 9. 統合ターミナル

このアプリの最大の特徴です。

画面下部にVS Codeのような統合ターミナルを表示してください。

デフォルト：

**PowerShell**

ターミナルの表示/非表示：

```text
Ctrl + `
```

または

```text
Ctrl + J
```

のいずれかを設定可能にしてください。

ターミナルの高さはドラッグして変更可能にしてください。

---

# 10. ターミナルタブ

複数のターミナルを開けるようにしてください。

例：

```text
┌────────────────────────────────────────────┐
│ PowerShell 1 │ PowerShell 2 │ cmd │   +    │
├────────────────────────────────────────────┤
│ PS C:\Project>                             │
│                                            │
└────────────────────────────────────────────┘
```

機能：

- 新規ターミナル
- ターミナル終了
- タブ切り替え
- タブ名変更
- 複数ターミナル
- コピー
- 貼り付け
- ANSIカラー
- スクロール

---

# 11. シェル選択

ターミナルごとにシェルを選択できるようにしてください。

Windows：

- PowerShell
- cmd
- Git Bash
- WSL

macOS/Linux：

- bash
- zsh
- fish
- その他PATH上のシェル

ユーザーが設定からデフォルトシェルを指定できるようにしてください。

---

# 12. Explorerとターミナルの連動

非常に重要な機能です。

設定に、

```text
Terminal Sync
```

というON/OFF設定を作ってください。

## Sync ON

エクスプローラーで移動したフォルダにターミナルも追従します。

例えば、

```text
Explorer
C:\Users\User\Desktop\Project
```

へ移動した場合、

```powershell
PS C:\Users\User\Desktop\Project>
```

になります。

ただし、ターミナルを勝手に再起動するのではなく、可能な限り現在のターミナルセッションを維持してください。

## Sync OFF

ExplorerとTerminalを完全に独立させます。

例：

```text
Explorer
C:\Project

Terminal
D:\Development
```

---

# 13. Terminal → Explorer連動

可能なら逆方向にも対応してください。

ターミナルから、

```powershell
cd C:\Project
```

した場合、

Explorer側もそのフォルダへ移動できるようにしてください。

設定で、

```text
Explorer follows Terminal
```

をON/OFFできるようにしてください。

---

# 14. タブ式Explorer

ブラウザやVS Codeのように、複数のExplorerタブを開けるようにしてください。

ショートカット：

```text
Ctrl + T
```

新しいタブ

```text
Ctrl + W
```

タブを閉じる

```text
Ctrl + Tab
```

タブ切り替え

各タブについて、

- 現在のパス
- 戻る/進む履歴
- Tree展開状態

を保持してください。

---

# 15. Git機能

このアプリではGitを第一級機能として扱ってください。

Gitリポジトリを開いた場合、Explorer上でGitの状態を視覚的に確認できるようにしてください。

## Gitリポジトリ検出

現在のフォルダ、または親フォルダに`.git`が存在する場合、自動的にGitリポジトリとして認識してください。

Gitが利用できない場合は、エラーでアプリ全体を停止させず、Git機能のみ無効化してください。

---

## Gitステータス表示

ファイル・フォルダの横にGit状態を表示してください。

例：

```text
📁 src
📄 main.go        M
📄 README.md      M
📄 new_file.txt   U
📄 deleted.txt    D
```

状態例：

- `M` Modified
- `A` Added
- `D` Deleted
- `U` Untracked
- `R` Renamed
- `C` Copied
- `?` Unknown

色だけに依存せず、アイコンや文字でも状態を識別できるようにしてください。

---

## Git変更ファイル一覧

左側のナビゲーションに、

```text
SOURCE CONTROL
```

ビューを追加してください。

例：

```text
SOURCE CONTROL

Changes (3)

M  main.go
M  README.md
U  test.go

Staged Changes (1)

A  new_feature.go
```

変更ファイルをクリックすると対象ファイルを開けるようにしてください。

---

## Git Diff

ファイルを選択するとDiffを表示できるようにしてください。

例：

```diff
- old code
+ new code
```

可能ならVS Codeのように、

- 左：変更前
- 右：変更後

のDiff Editorを実装してください。

---

## Git操作

GUIから以下の操作を実行できるようにしてください。

- Status
- Add
- Stage
- Unstage
- Commit
- Push
- Pull
- Fetch
- Checkout
- Create Branch
- Delete Branch
- Rename Branch
- Merge
- Rebase
- Stash
- Stash Pop
- Discard Changes
- Clone Repository
- Initialize Repository

破壊的操作については確認ダイアログを表示してください。

---

## Git Commit

Source Controlビューからコミットできるようにしてください。

例：

```text
Commit Message
┌──────────────────────────────┐
│ fix: update file explorer    │
└──────────────────────────────┘

[ Commit ]
```

コミット前にステージされたファイルを確認できるようにしてください。

---

## Git Branch

現在のブランチをUI上で常に分かるようにしてください。

例：

```text
main
```

クリックするとブランチ一覧を表示。

```text
Branches

★ main
  develop
  feature/terminal
  feature/git
```

新規ブランチ作成・切り替えに対応してください。

---

## Git Log

Git履歴を表示できるようにしてください。

例：

```text
main

● 8f32ab1  fix: terminal sync
│
● 71ac921  feat: add git support
│
● 62aa123  initial commit
```

コミットをクリックすると、

- Commit Hash
- Author
- Date
- Message
- Changed Files
- Diff

を表示してください。

---

## Git Remote

リモートリポジトリを確認できるようにしてください。

例：

```text
origin
https://github.com/user/project.git
```

可能なら、

- Fetch
- Pull
- Push

をGUIから実行してください。

GitHubなど特定サービスに依存しない設計にしてください。

---

# 16. ファイル操作

以下を実装してください。

- コピー
- 切り取り
- 貼り付け
- 移動
- 削除
- ゴミ箱へ移動
- 完全削除
- 名前変更
- 新規フォルダ
- 新規ファイル

ファイル操作中は進捗を表示してください。

大量ファイルのコピー・移動でもUIをフリーズさせないでください。

---

# 17. キーボード操作

VS Code/Explorerを参考にしてください。

```text
Ctrl + `
ターミナル表示/非表示

Ctrl + J
ターミナル表示/非表示

Ctrl + T
Explorer新規タブ

Ctrl + W
タブを閉じる

Ctrl + Tab
タブ切り替え

Ctrl + L
アドレスバー

Ctrl + F
検索

Ctrl + P
クイックファイル検索

Ctrl + Shift + P
コマンドパレット

F2
名前変更

Delete
削除

F5
更新

Alt + ↑
親フォルダ

Alt + ←
戻る

Alt + →
進む

→
Tree展開

←
Tree折りたたみ

Enter
開く
```

Git操作についても可能な範囲でキーボード操作に対応してください。

OSごとの標準ショートカットと競合する場合は適切に調整してください。

---

# 18. コマンドパレット

VS Code風のコマンドパレットを実装してください。

```text
Ctrl + Shift + P
```

例：

```text
> Toggle Terminal
> New Terminal
> New Explorer Tab
> Toggle Terminal Sync
> Toggle Navigation
> Expand All
> Collapse All
> Show Hidden Files
> Refresh
> Open Settings
> Change Theme
> Git: Status
> Git: Stage
> Git: Commit
> Git: Push
> Git: Pull
> Git: Checkout
> Git: Create Branch
```

コマンド名を入力して実行できるようにしてください。

---

# 19. 設定

設定画面を作成してください。

## Appearance

- Light
- Dark
- System

## Explorer

- 隠しファイル表示
- 拡張子表示
- デフォルト表示形式
- Treeインデント幅
- アイコンサイズ

## Terminal

- デフォルトシェル
- Terminal Sync
- Explorer follows Terminal
- Terminal高さ
- フォント
- フォントサイズ

## Git

- Git自動検出
- Git状態表示
- Git変更監視
- 自動Fetch
- Pull前確認
- Push前確認

## Navigation

- ナビゲーション表示
- Favorites
- Source Control表示

設定はJSONまたはSQLiteなど、適切な方法で永続化してください。

---

# 20. プレビュー

将来的に拡張できる設計にしてください。

対応候補：

- TXT
- Markdown
- JSON
- CSV
- 画像
- PDF

まずMVPでは、

- テキスト
- Markdown
- 画像

程度から実装してください。

Markdownは可能なら、

- ソース表示
- プレビュー表示

を切り替えられるようにしてください。

---

# 21. デザイン

VS Codeを強く参考にしてください。

重要なのは、

**「ごちゃごちゃしていない」「キーボード操作が快適」「開発者が毎日使える」**

ことです。

ダークテーマ：

```text
暗めの背景
控えめな境界線
シンプルなアイコン
```

ライトテーマ：

```text
明るい背景
薄い境界線
```

派手なアニメーションは避けてください。

Git状態については、VS Codeのように視認性を高めつつ、色だけに依存しないUIにしてください。

---

# 22. パフォーマンス

以下を重視してください。

- UIスレッドをブロックしない
- ファイル一覧の非同期読み込み
- TreeのLazy Loading
- Virtual Scrolling
- 大量ファイル対応
- 検索のキャンセル
- ファイル監視
- Git状態取得の非同期処理
- メモリ使用量削減

10万ファイル程度のディレクトリでも可能な限り操作できる設計にしてください。

Gitリポジトリについても、大規模リポジトリでUIが固まらないようにしてください。

---

# 23. ファイル監視

fsnotifyなどを使用し、

- ファイル作成
- ファイル削除
- ファイル変更
- フォルダ作成
- フォルダ削除

を検知してください。

Explorerを手動更新しなくても変更が反映されるようにしてください。

Gitリポジトリでは、変更を検知した際にGitステータスも適切に更新してください。

---

# 24. プロジェクト構成

責務を明確に分離してください。

例：

```text
project/
├── cmd/
├── internal/
│   ├── explorer/
│   ├── filesystem/
│   ├── terminal/
│   ├── git/
│   ├── search/
│   ├── history/
│   ├── settings/
│   └── favorites/
├── frontend/
│   ├── components/
│   ├── explorer/
│   ├── terminal/
│   ├── navigation/
│   ├── toolbar/
│   ├── git/
│   └── settings/
├── assets/
└── README.md
```

必要に応じて最適な構成に変更してください。

Git処理はUIから直接実行せず、Go側のGitサービス層を経由してください。

---

# 25. Gitアーキテクチャ

Git機能は将来の拡張を考慮して抽象化してください。

例えば、

```text
GitService
├── Status
├── Stage
├── Unstage
├── Commit
├── Push
├── Pull
├── Fetch
├── Branch
├── Checkout
├── Diff
├── Log
└── Remote
```

のように責務を分離してください。

Git CLIを利用する場合でも、UI層から直接`git`コマンドを呼び出さないでください。

コマンド実行時の、

- stdout
- stderr
- exit code
- cancellation
- timeout

を適切に処理してください。

---

# 26. セキュリティ

ファイル操作は慎重に実装してください。

特に、

- パストラバーサル
- シェルコマンド実行
- 削除処理
- Gitコマンド実行
- 権限エラー

を適切に処理してください。

ユーザーが明示的に実行したターミナルコマンド以外のシェルコマンドを勝手に実行しないでください。

Git操作もユーザーの明示的な操作なしに、commit/push/resetなどの破壊的操作を実行しないでください。

---

# 27. エラー処理

例えば、

```text
アクセス拒否
ファイルが存在しない
ファイルが使用中
権限不足
ディスク容量不足
Gitがインストールされていない
Gitリポジトリではない
Merge Conflict
Push Failed
Authentication Failed
```

などをユーザーに分かりやすく表示してください。

クラッシュではなく、可能な限り安全に復帰してください。

Gitエラーについては、可能ならGitのstderrをユーザーが理解しやすい形で表示してください。

---

# 28. 開発方法

いきなり全機能を実装しないでください。

以下の順番で開発してください。

## Phase 1：MVP

まず、

1. ウィンドウ
2. ツールバー
3. ナビゲーション
4. ファイル一覧
5. Tree
6. フォルダ移動
7. PowerShellターミナル
8. Terminal表示/非表示
9. Terminal Sync

を実装してください。

## Phase 2

- ターミナルタブ
- Explorerタブ
- ファイル操作
- 履歴
- Favorites
- 検索

## Phase 3：Git

- Gitリポジトリ検出
- Git Status
- Explorer上のGit状態表示
- Source Controlビュー
- Stage / Unstage
- Commit
- Diff
- Branch
- Checkout
- Log
- Push / Pull / Fetch

## Phase 4

- コマンドパレット
- 設定
- プレビュー
- Git高度機能
- GitHubなどへの将来的な連携

## Phase 5

将来的な拡張機能を追加できるアーキテクチャを整備してください。

---

# 29. AIへの重要な指示

コードを書く前に、

1. 要件を整理
2. 技術選定
3. アーキテクチャ設計
4. ディレクトリ構成
5. UI構成
6. データフロー
7. TerminalとExplorerの連動方式
8. Windows/macOS/LinuxでのPTY実装方法
9. Git機能の実装方式
10. Git CLIとGoライブラリの比較
11. Git状態とファイル監視の連動方式

を説明してください。

その後、Phase 1から実装してください。

各段階で、

- 完成した機能
- 変更したファイル
- 実行方法
- テスト方法
- 残っている問題

を説明してください。

**既存コードを勝手に大量削除・置換しないでください。**

コードを生成する場合は、必ず実際にビルド可能な状態を意識してください。

エラーが発生した場合は、原因を分析して修正し、修正後のコードがビルドできることを確認してください。

最終的には、

**「VS CodeのExplorer・統合ターミナル・Git機能を、独立した高速ファイルマネージャーとして再構築したアプリ」**

を目指してください。
