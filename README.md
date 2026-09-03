# GitFootprint

GitFootprint is a lightweight browser extension that shows repository size directly on GitHub.

## Tech Stack

* TypeScript
* Vite
* Chrome Extension Manifest V3
* GitHub REST API
* Native DOM API

## Features

* Repository size
* Current files size
* Git history size
* Largest files in the repository

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
