<div align="center">

<img src="./docs/public/logo.svg" width="150" alt="headify">

# headify

Node.js 文件头部横幅生成工具。

[![Buy me a coffee](https://img.shields.io/badge/Buy%20me%20a%20coffee-048754?logo=buymeacoffee)](https://www.lujiahao.com/sponsor)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](https://www.typescriptlang.org/)
[![Test](https://img.shields.io/github/actions/workflow/status/ColoristLab/headify/tests.yml?label=Test&logo=github&style=flat-square&branch=main)](https://github.com/ColoristLab/headify/actions/workflows/tests.yml)
[![Node](https://img.shields.io/node/v/headify.svg)](https://nodejs.org/en/about/previous-releases)
[![Vitest](https://img.shields.io/badge/tested%20with-vitest-fcc72b.svg?logo=vitest)](https://vitest.dev/)
[![codecov](https://codecov.io/github/ColoristLab/headify/graph/badge.svg?token=YR846BMB6Y)](https://codecov.io/github/ColoristLab/headify)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/ColoristLab/headify/blob/main/LICENSE)

</div>

## 安装

```bash
npm install -D headify
```

## 快速开始

为指定文件添加头部横幅注释：

```bash
headify "dist/**/*.{js,css}"
```

headify 默认读取项目 `package.json` 中的元数据，并使用内置模板生成文件头部。你也可以通过自定义模板、排除规则和预览模式，灵活控制处理过程。

## 文档

完整文档请访问 [headify 文档站点](https://ColoristLab.github.io/headify/)。
