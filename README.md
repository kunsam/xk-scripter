xkool scripter!

### Issue

若当前同时开发多个需求，每个需求各有依赖，比如产品规则/接口/测试，在等待某一个功能开发时需要切换全部代码进入另一个功能开发状态。当前项目是 submodule 结构:

开发功能 A:

- main project: branchA
- submodule1(如：fontend_utils): branchA2
- submodule2: branchA2

开发功能 B:

- main project: branchB
- submodule1: branchB2
  - changed file1
- submodule2: branchB3
  - changed file2
- submodule3: branchB3
- ……

**当前项目切换功能开发时，一次命令行操作需要执行多个 cd|gco|gcb|stash 等操作，效率低**

对此使用小库脚本库(`xk-scripter`)开发了 git 高级操作。

### Install

`sudo npm i xk-scripter -g`

### Usage

- `xks gcb <branchname>`
- `xks gcba <branchname>`
- `xks gco <branchname>`
- `xks gcoa <branchname>`
- `xks gsave <featureId>`
- `xks guse`
- `xks gclear`

### Scene

- 即将开发功能 A 时：执行 `xks gcb featureA`, 脚本将会提示你选择哪些 submodule 进行同时新建分支操作。
- 开发 A 中断时：执行`xks gsave featureA`，保存全部变更与分支状态（不进行 commit）
- 想回到开发 A 时：执行`xks guse`，脚本提示你选择恢复哪个 feature，选择恢复 featureA 保存时的状态（当前状态未保存的话会失败，可以执行 `xks gsave featureCurrent` 保存当前的所有状态）
- 开发 A 完毕时：执行`xks gclear`，脚本提示你选择删除哪个 feature，脚本删除对应的数据

### Document

### `xks gsave <featureId>`

对{git 主目录和全部 submodule 目录中存在 diffChanged 的目录} 执行保存操作，保存操作会将每个改动目录的变化压入 stash stack 中，并记录对应的 stash hash 以及对应的分支名称

### `xks guse`

弹出全部保存过的 featureId 列表，对{用户选择的一个 featureId}进行恢复操作，若当前 git state 存在 diff，无法恢复，恢复操作会将目录切换为保存时的分支，并弹出对应的 stash item

### `xks gclear`

弹出全部保存过的 featureId 列表，对{用户选择的一个 featureId}进行删除操作，删除对应的 featureId 数据

### `xks gcb <branchname>`

对{git 主目录和全部用户选择的 submodule 目录} 执行 `git checkout -b <branchname>`

### `xks gcba <branchname>`

对{git 主目录和全部 submodule 目录} 执行 `git checkout -b <branchname>`

### `xks gco <branchname>`

对{git 主目录和全部用户选择的 submodule 目录} 执行 `git checkout <branchname>`

### `xks gcoa <branchname>`

对{git 主目录和全部 submodule 目录} 执行 `git checkout <branchname>`
