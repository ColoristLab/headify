# Command-Line Help

Run `headify --help` to view command usage and available options:

```sh
headify --help
```

```text
Usage:
  $ headify <...files>

Commands:
  <...files>  Prepend banner headers to files.

For more info, run any command with the `--help` flag:
  $ headify --help

Options:
  -t, --template <path>        Path to banner template file
  -e, --exclude <...patterns>  Exclude files or directories (supports glob)
  --start-year <year>          Starting year of the copyright notice
  --dry-run                    Preview changes without writing files
  -h, --help                   Display this message
  -v, --version                Display version number
```

| Option                        | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| `-t, --template <path>`       | Specify a custom template file                                 |
| `-e, --exclude <...patterns>` | Exclude specified files or directories, supports Glob patterns |
| `--start-year <year>`         | Specify the starting year of the copyright notice              |
| `--dry-run`                   | Preview changes without actually writing files                 |
| `-h, --help`                  | Display help information                                       |
| `-v, --version`               | Display version number                                         |
