# Git Repository Setup Guide for Hostel Marketplace

This guide walks you through setting up a Git repository for your hostel marketplace project and importing all your files.

## Initial Setup

### 1. Install Git (if not already installed)

**For Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install git
```

**For Windows:**
- Download and install from [git-scm.com](https://git-scm.com/download/win)

**For macOS:**
```bash
brew install git
```
Or download from [git-scm.com](https://git-scm.com/download/mac)

### 2. Configure Git

Set your username and email:
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## Setting Up the Repository

### Option 1: Create a New Repository

#### 1. Navigate to your project directory
```bash
cd /path/to/hostel-marketplace
```

#### 2. Initialize a new Git repository
```bash
git init
```

#### 3. Create a .gitignore file
Create a file named `.gitignore` in your project root with the following content:

```
# Dependencies
/node_modules
/.pnp
.pnp.js

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build files
/build
/dist

# Logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Editor directories and files
.idea/
.vscode/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db
```

#### 4. Add all files to the staging area
```bash
git add .
```

#### 5. Commit the files
```bash
git commit -m "Initial commit with project files"
```

#### 6. Add a remote repository (GitHub, GitLab, Bitbucket, etc.)

**Create a repository on your preferred platform first, then:**

```bash
git remote add origin https://github.com/yourusername/hostel-marketplace.git
```

#### 7. Push your code to the remote repository
```bash
git push -u origin main
```
Note: If you're using an older Git version, you might need to use `master` instead of `main`.

### Option 2: Clone an Existing Repository and Add Files

#### 1. Clone the repository
```bash
git clone https://github.com/yourusername/hostel-marketplace.git
```

#### 2. Copy your project files
Copy all your project files into the cloned repository directory, being careful not to overwrite the `.git` folder.

#### 3. Add all files to the staging area
```bash
cd hostel-marketplace
git add .
```

#### 4. Commit the files
```bash
git commit -m "Add project files"
```

#### 5. Push to the remote repository
```bash
git push origin main
```

## Working with Large Files

If your project contains large files (like images or videos), consider using Git LFS (Large File Storage):

#### 1. Install Git LFS
```bash
# Ubuntu/Debian
sudo apt install git-lfs

# macOS
brew install git-lfs

# Windows
# Download and install from https://git-lfs.github.com/
```

#### 2. Set up Git LFS in your repository
```bash
cd /path/to/hostel-marketplace
git lfs install
```

#### 3. Track large file types
```bash
git lfs track "*.png" "*.jpg" "*.jpeg" "*.gif" "*.mp4"
```

This creates a `.gitattributes` file which should be committed:
```bash
git add .gitattributes
git commit -m "Set up Git LFS for large files"
```

## Best Practices for Team Collaboration

### 1. Branch Management
- Create a new branch for each feature or bugfix
```bash
git checkout -b feature/new-feature-name
```

- Push branch to remote
```bash
git push -u origin feature/new-feature-name
```

### 2. Pull Requests
- After completing your work, create a pull request on your hosting platform
- Have team members review code before merging

### 3. Regular Synchronization
- Regularly pull changes from the main branch
```bash
git checkout main
git pull
git checkout your-branch
git merge main
```

### 4. Commit Guidelines
- Use descriptive commit messages
- Follow a consistent format (e.g., "feat: add user dashboard" or "fix: correct booking date validation")
- Make small, focused commits rather than large changes

## Troubleshooting Common Issues

### "Files too large" error:
- If you encounter "Files too large" errors, set up Git LFS as described above
- Alternatively, add large files to .gitignore and consider storing them elsewhere

### "Merge conflicts" error:
1. Identify conflicting files:
```bash
git status
```

2. Open the files with conflicts and resolve them (look for `<<<<<<< HEAD`, `=======`, and `>>>>>>> branch-name` markers)

3. Mark conflicts as resolved:
```bash
git add <resolved-file>
```

4. Complete the merge:
```bash
git commit -m "Resolve merge conflicts"
```

### Authentication issues:
- Ensure you have the correct access rights to the repository
- Consider using SSH keys instead of passwords:
```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your.email@example.com"

# Add key to SSH agent
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

# Then add the public key to your GitHub/GitLab/etc. account
```

## Maintaining Your Repository

### Regular Maintenance
```bash
# Verify repository integrity
git fsck

# Clean up unnecessary files
git gc

# Prune deleted remote branches
git fetch --prune
```

### Tagging Releases
```bash
# Create a tag for a release version
git tag -a v1.0.0 -m "Version 1.0.0 release"

# Push tags to remote
git push --tags
```

---

Following this guide will ensure that all your project files are properly imported into your Git repository with good practices for ongoing development and collaboration. 