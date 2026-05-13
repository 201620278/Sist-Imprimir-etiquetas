const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  imprimirEtiqueta: (config) => ipcRenderer.send('imprimir-etiqueta', config),
  listarImpressoras: () => ipcRenderer.invoke('listar-impressoras')
});
