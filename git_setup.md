# Git Setup for Hostel Marketplace

## Initial Git Setup

1. **Initialize the repository**:
   ```bash
   git init
   ```

2. **Add the files to staging**:
   ```bash
   git add .
   ```

3. **Commit the initial files**:
   ```bash
   git commit -m "Initial commit: Hostel Marketplace project setup"
   ```

## Remote Repository Setup

1. **Create a new repository on GitHub/GitLab/Bitbucket**

2. **Add the remote repository**:
   ```bash
   git remote add origin https://github.com/yourusername/hostel-marketplace.git
   ```

3. **Push to the remote repository**:
   ```bash
   git push -u origin master
   # or if you're using main as default branch
   git push -u origin main
   ```

## Git Workflow for Development

1. **Create a new branch for features**:
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make changes and commit regularly**:
   ```bash
   git add .
   git commit -m "Description of changes"
   ```

3. **Push the branch to remote**:
   ```bash
   git push origin feature/feature-name
   ```

4. **Create a pull request on GitHub/GitLab/Bitbucket**

5. **After review, merge into main branch**

## Git Best Practices

1. **Write meaningful commit messages**
   - Use present tense ("Add feature" not "Added feature")
   - Be descriptive but concise
   - Reference issue numbers if applicable (#123)

2. **Commit frequently with logical units of work**
   - Don't bundle unrelated changes in one commit
   - Separate fixes, features, and refactoring

3. **Keep your branches updated with main**:
   ```bash
   git checkout main
   git pull
   git checkout your-branch
   git merge main
   # or git rebase main (if preferred)
   ```

4. **Use .gitignore properly**
   - Don't commit node_modules, build directories, or environment files
   - Don't commit database files (.sqlite, .db)
   - Don't commit log files or temporary files

5. **Consider using Git LFS for large files**
   - Useful for image assets and other binary files
   - `git lfs install`
   - `git lfs track "*.jpg" "*.png"` 