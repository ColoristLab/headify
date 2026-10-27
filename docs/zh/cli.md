# 命令行帮助

运行 `headify --help` 查看命令用法及可用选项：

```sh
headify --help
```

```text
Usage:
  $ headify <...files>

Commands:
  <...files>  Prepend banner headers to files.

Options:
  -t, --template <path>        Path to Eta template file
  -e, --exclude <...patterns>  Exclude files or directories (supports glob)
      --dry-run                Preview changes without writing files
  -h, --help                   Display this message
  -v, --version                Display version number
```

| 选项                          | 说明                               |
| ----------------------------- | ---------------------------------- |
| `-t, --template <path>`       | 指定自定义模板文件                 |
| `-e, --exclude <...patterns>` | 排除指定文件或目录，支持 Glob 模式 |
| `--dry-run`                   | 预览修改结果，不实际写入文件       |
| `-h, --help`                  | 显示帮助信息                       |
| `-v, --version`               | 显示版本号                         |
