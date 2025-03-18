// Preload script runs in Electron before web content is loaded
// It has access to both Node.js and DOM APIs
const { contextBridge } = require('electron');

// Expose any needed APIs from the main process to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // You can add functions here to expose to the renderer process if needed
  // For example:
  // setFullscreen: (flag) => ipcRenderer.invoke('set-fullscreen', flag)
});

// The preload script can also add event listeners or modify the window object
window.addEventListener('DOMContentLoaded', () => {
  // You can modify the DOM here if needed
  console.log('DOM fully loaded and parsed');
});