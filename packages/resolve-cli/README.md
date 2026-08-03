# Resolve CLI

The Resolve CLI is the developer toolkit for maintaining the Resolve platform.

## Goals

- Create new blocklist categories
- Import blocklists
- Validate domains
- Merge blocklists
- Publish new versions
- Sync blocklists
- Generate reports
- Backup and restore repositories

---

## Commands

### Test

```bash
resolve hello
```

### Categories

```bash
resolve new-category gambling
```

### Import

```bash
resolve import gambling gambling.txt
```

### Validate

```bash
resolve validate
```

### Publish

```bash
resolve publish
```

### Sync

```bash
resolve sync
```

---

## Planned Features

- Automatic versioning
- Cloud publishing
- Blocklist statistics
- Duplicate detection
- Repository repair
- Update checker
- CI/CD integration