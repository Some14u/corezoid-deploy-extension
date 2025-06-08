# Corezoid Deploy Shortcut Extension

Browser extension for Firefox and Chrome that adds keyboard shortcut functionality to Corezoid process editor pages.

## Features

- **Keyboard Shortcut**: Use `Ctrl+S` (or `Cmd+S` on Mac) to trigger Deploy action
- **Smart Button Detection**: Only works when Deploy button is available and visible
- **Configurable Domains**: Add/remove supported domains in extension options
- **URL Pattern Matching**: Works on pages matching `domain/workspace_uuid/process/process_id`
- **Cross-browser Support**: Compatible with both Chrome and Firefox

## Installation

### Chrome
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked" and select the extension folder

### Firefox
1. Open Firefox and navigate to `about:debugging`
2. Click "This Firefox"
3. Click "Load Temporary Add-on" and select the `manifest.json` file

## Configuration

1. Click the extension icon in your browser toolbar
2. Click "Configure Domains" to open the options page
3. Add or remove domains where the extension should work
4. Default domain: `https://admin.corezoid.com`

## Usage

1. Navigate to a Corezoid process editor page (URL pattern: `domain/workspace_uuid/process/process_id`)
2. Press `Ctrl+S` (or `Cmd+S` on Mac) to trigger the Deploy action
3. The extension will click the Deploy button if it's available
4. If Deploy button is not present, no action will be performed

## Technical Details

The extension identifies the Deploy button using the selector `[el="ProcSave"]` and verifies it has the required CSS classes and is visible. It uses DOM click simulation to maintain proper UI state updates in the Corezoid editor.

URL pattern matching ensures the extension only activates on valid Corezoid process editor pages following the format: `domain/workspace_uuid/process/process_id`

The extension includes smart detection to only attempt Deploy when the button is actually available, preventing errors when the process cannot be deployed.

## Development

The extension uses Manifest V3 and includes:
- `content_script.js`: Main functionality for keyboard shortcuts and button detection
- `options.html/js`: Configuration interface for domain management
- `popup.html/js`: Extension popup with status information
