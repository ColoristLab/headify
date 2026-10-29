# Command Line Help

Run `headify --help` to view command usage and available options:

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

| Option                        | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `-t, --template <path>`       | Specify a custom template file                                 |
| `-e, --exclude <...patterns>` | Exclude specified files or directories, supports Glob patterns |
| `--dry-run`                   | Preview changes without actually writing to files              |
| `-h, --help`                  | Display help information                                       |
| `-v, --version`               | Display version number                                         |
