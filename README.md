# GitFootprint

GitFootprint is a lightweight browser extension that shows useful repository size information directly on GitHub.

## Tech Stack

* TypeScript
* Vite
* Chrome Extension Manifest V3
* GitHub REST API
* Native DOM API

## Features

* GitHub repository size
* Current repository snapshot size
* Number of files
* Largest files in the repository

### Size Metrics

GitFootprint currently displays two different size metrics:

**GitHub repository size**

The `size` value reported by the GitHub Repository API. GitHub provides this value as part of the repository metadata.

**Current snapshot size**

The total size of all files (`blob` objects) in the current repository tree. GitFootprint calculates this value by summing the sizes of all files in the selected branch.

These values represent different metrics and should not be directly subtracted from each other to calculate Git history size.

## Development

Clone the repository:

```bash
git clone https://github.com/YOUR_USERNAME/GitFootprint.git
cd GitFootprint
```

Install dependencies:

```bash
npm install
```

Build the extension:

```bash
npm run build
```

The compiled extension will be available in the `dist/` directory.

### Load in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked**
4. Select the `dist/` directory
5. Open any public GitHub repository

