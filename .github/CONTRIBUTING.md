# 贡献指南

感谢你对本项目的关注和贡献！无论是提交 Bug 修复、改进现有功能，还是完善文档，我们都非常欢迎。

## 语言

你可以使用**任何语言**进行贡献。

本项目主要使用中文进行维护。如果方便，我们建议代码注释、提交信息及文档等尽量使用中文，以便与项目现有内容保持一致，但这**不是强制要求**。

## 开发环境

开始之前，请确保已安装以下工具：

- [Node.js](https://nodejs.org/)：请使用项目要求的版本。
- [pnpm](https://pnpm.io/)：用于安装项目依赖。

### 获取项目

1. 在 GitHub 上 [Fork 本项目](https://github.com/ColoristLab/headify/fork)，将项目复制到自己的账号下。
2. 克隆自己 Fork 后的仓库：

```sh
git clone https://github.com/YOUR_USERNAME/headify.git

cd headify
```

3. 添加原仓库作为上游远程仓库：

```sh
git remote add upstream https://github.com/ColoristLab/headify.git
```

4. 安装项目依赖：

```sh
pnpm install
```

### 创建分支

开始修改之前，建议基于原仓库最新的代码创建一个独立分支：

```sh
git fetch upstream # 获取原仓库的最新代码

# 基于原仓库的 main 分支创建新分支
git switch -c feat/your-feature upstream/main
```

请根据实际改动选择合适的分支名称，例如 `feat/xxx`、`fix/xxx`。

## 代码规范

- 提交代码前，请确保代码格式、Lint 和类型检查通过。
- 新增功能或修复 Bug 时，建议同时补充相应的测试。
- 尽量保持代码风格与项目现有代码一致。
- 避免引入不必要的依赖。

## 提交贡献

完成修改后，将代码提交并推送到自己的 Fork 仓库：

```sh
git add .

git commit -m "feat: 描述本次改动"

git push origin feat/your-feature
```

然后前往 GitHub，向本项目的 `main` 分支创建 Pull Request。

在提交 Pull Request 之前，建议先创建一个 Issue 讨论你的想法或改动。

尤其是涉及新功能、较大改动或架构调整时，提前讨论可以避免方向不一致，也能减少不必要的工作。

对于简单的 Bug 修复、拼写修正和文档改进，可以直接提交 Pull Request，无需提前创建 Issue。

提交 Pull Request 时，请尽量确保：

- 标题和描述清晰，说明本次改动的目的和内容。
- 尽可能将不同的改动拆分为独立的提交。
- 确保相关检查和测试通过。

感谢你的贡献！
