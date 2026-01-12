# Mozilla Profile Manager

A command-line tool for managing Mozilla Firefox and Thunderbird profiles. Easily create, switch, backup, and manage multiple browser profiles.

## Overview

Mozilla Profile Manager is designed to simplify the management of Firefox and Thunderbird profiles. Whether you need separate profiles for work and personal use, testing different configurations, or managing profiles for multiple users, this tool provides a streamlined interface for profile operations.

## Features

- **Profile Creation**: Create new profiles with custom names and configurations
- **Profile Switching**: Quickly switch between different profiles
- **Profile Backup**: Backup and restore profile data
- **Profile Management**: List, rename, and delete profiles
- **Cross-Platform**: Works on Windows, macOS, and Linux
- **Command-Line Interface**: Easy-to-use CLI for automation and scripting

## Installation

### Prerequisites

- Python 3.7 or higher
- Mozilla Firefox or Thunderbird installed

### Install from Source

```bash
git clone https://github.com/The-WarLog/MOZILLA_PROFILE_MANAGER.git
cd MOZILLA_PROFILE_MANAGER
pip install -r requirements.txt
```

## Usage

### Basic Commands

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

### Examples

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

## Configuration

You can customize the profile manager behavior by editing the `config.ini` file:

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

### Setting Up Development Environment

```bash
# Clone the repository
git clone https://github.com/The-WarLog/MOZILLA_PROFILE_MANAGER.git
cd MOZILLA_PROFILE_MANAGER

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Run tests
python -m pytest tests/
```

### Project Structure

```
MOZILLA_PROFILE_MANAGER/
├── src/
│   ├── profile_manager.py    # Main application logic
│   ├── profile.py             # Profile class and operations
│   ├── config.py              # Configuration management
│   └── utils.py               # Utility functions
├── tests/
│   ├── test_profile.py        # Profile tests
│   └── test_manager.py        # Manager tests
├── docs/                      # Documentation
├── LICENSE                    # MIT License
├── README.md                  # This file
└── requirements.txt           # Dependencies
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

**Note**: This project is currently in development. Features and documentation may change.