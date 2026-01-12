# Mozilla Profile Manager

> **⚠️ Note**: This project is in the planning stage. The features and code described below represent the intended functionality and are not yet implemented.

A command-line tool for managing Mozilla Firefox and Thunderbird profiles. Easily create, switch, backup, and manage multiple browser profiles.

## Overview

Mozilla Profile Manager will be designed to simplify the management of Firefox and Thunderbird profiles. Whether you need separate profiles for work and personal use, testing different configurations, or managing profiles for multiple users, this tool will provide a streamlined interface for profile operations.

## Planned Features

- **Profile Creation**: Create new profiles with custom names and configurations
- **Profile Switching**: Quickly switch between different profiles
- **Profile Backup**: Backup and restore profile data
- **Profile Management**: List, rename, and delete profiles
- **Cross-Platform**: Support for Windows, macOS, and Linux
- **Command-Line Interface**: Easy-to-use CLI for automation and scripting

## Installation

> **Note**: Installation instructions are not yet available as the project is under development.

### Planned Prerequisites

- Python 3.7 or higher
- Mozilla Firefox or Thunderbird installed

### Future Installation Steps

Once implemented, installation will be:

```bash
git clone https://github.com/The-WarLog/MOZILLA_PROFILE_MANAGER.git
cd MOZILLA_PROFILE_MANAGER
pip install -r requirements.txt  # To be added
```

## Planned Usage

> **Note**: The tool is not yet implemented. Below are the planned commands.

### Planned Basic Commands

```bash
# List all available profiles
python profile_manager.py list

# Create a new profile
python profile_manager.py create <profile_name>

# Launch Firefox with a specific profile
python profile_manager.py launch <profile_name>

# Backup a profile
python profile_manager.py backup <profile_name> <backup_path>

# Restore a profile from backup
python profile_manager.py restore <backup_path> <profile_name>

# Delete a profile
python profile_manager.py delete <profile_name>
```

### Example Usage (Planned)

```bash
# Create a profile for work
python profile_manager.py create work-profile

# Launch Firefox with the work profile
python profile_manager.py launch work-profile

# Backup the work profile
python profile_manager.py backup work-profile ~/backups/work-profile-backup

# List all profiles
python profile_manager.py list
```

## Profile Locations

Profiles are stored in the following default locations:

- **Windows**: `%APPDATA%\Mozilla\Firefox\Profiles\`
- **macOS**: `~/Library/Application Support/Firefox/Profiles/`
- **Linux**: `~/.mozilla/firefox/`

## Planned Configuration

The tool will support customization through a `config.ini` file:

```ini
[General]
default_browser = firefox
backup_location = ~/profile-backups

[Firefox]
profiles_path = auto

[Thunderbird]
profiles_path = auto
```

## Development

### Current Status

The repository is currently in the planning phase. Contributors are welcome to help implement the planned features.

### Future Development Setup

Once the project structure is in place:

```bash
# Clone the repository
git clone https://github.com/The-WarLog/MOZILLA_PROFILE_MANAGER.git
cd MOZILLA_PROFILE_MANAGER

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (to be added)
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests (to be added)
python -m pytest tests/
```

### Planned Project Structure

```
MOZILLA_PROFILE_MANAGER/
├── src/
│   ├── profile_manager.py  # Main application logic
│   ├── profile.py          # Profile class and operations
│   ├── config.py           # Configuration management
│   └── utils.py            # Utility functions
├── tests/
│   ├── test_profile.py     # Profile tests
│   └── test_manager.py     # Manager tests
├── docs/                   # Documentation
├── LICENSE                 # MIT License
├── README.md               # This file
└── requirements.txt        # Dependencies
```

### Current Repository Structure

```
MOZILLA_PROFILE_MANAGER/
├── LICENSE     # MIT License
└── README.md   # This file
```

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## Troubleshooting

### Profile Not Found

If you encounter a "profile not found" error, ensure that:
- The profile name is correct (use `list` command to verify)
- Firefox/Thunderbird is not running
- You have proper permissions to access the profiles directory

### Permission Denied

On Linux/macOS, you may need to adjust permissions:
```bash
chmod +x profile_manager.py
```

### Windows Path Issues

On Windows, use forward slashes or escape backslashes in paths:
```bash
python profile_manager.py backup work-profile C:/backups/work-profile
```

## Roadmap

### Phase 1: Core Implementation (Planned)
- [ ] Basic profile listing functionality
- [ ] Profile creation and deletion
- [ ] Profile launching
- [ ] Cross-platform path detection
- [ ] Basic CLI interface
- [ ] Unit tests

### Phase 2: Enhanced Features (Future)
- [ ] Profile backup and restore
- [ ] Configuration file support
- [ ] Profile renaming
- [ ] Better error handling and logging

### Phase 3: Advanced Features (Future)
- [ ] GUI interface for profile management
- [ ] Profile synchronization across devices
- [ ] Profile templates for common configurations
- [ ] Extension management within profiles
- [ ] Profile encryption for sensitive data
- [ ] Integration with Firefox Sync
- [ ] Support for other Mozilla applications

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Mozilla Foundation for Firefox and Thunderbird
- Contributors and testers who help improve this tool

## Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/The-WarLog/MOZILLA_PROFILE_MANAGER/issues)
- Contact: [The-WarLog](https://github.com/The-WarLog)

## Disclaimer

This tool is not officially affiliated with Mozilla. Firefox and Thunderbird are trademarks of the Mozilla Foundation.

---

## Project Status

**Current Phase**: Planning and Design

This project is currently in the early planning stage. The README describes the intended functionality and architecture. Contributions are welcome to help implement these features!

### How to Get Involved

1. Check the [Roadmap](#roadmap) for planned features
2. Open an issue to discuss implementation details
3. Submit a pull request with your contributions

**Note**: All features described in this README are planned and not yet implemented.