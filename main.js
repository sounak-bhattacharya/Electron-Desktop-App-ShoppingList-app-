const electron = require('electron');
const url = require('url');
const path = require('path');
const { createPublicKey } = require('crypto');

const {app, BrowserWindow, Menu, ipcMain} = electron;

//Set ENV
process.env.NODE_ENV = 'production';

let mainWindow;
let addWindow;

//Listen for app to be ready
app.on('ready', function(){
  mainWindow = new BrowserWindow({
    webPreferences: {nodeIntegration: true}
  });
  //Load html to Window
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'), protocol: 'file:',
    slashes: true
  }));

  //Quit app when Closed
  mainWindow.on('closed', function(){
    app.quit();
  });

  //Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    //Insert Menu
    Menu.setApplicationMenu(mainMenu);
});

//Handle Create Add Window
function createAddWindow(){
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add Shopping List Item',
    webPreferences: {nodeIntegration: true}
  });
  //Load html to Window
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'addWindow.html'), protocol: 'file:',
    slashes: true
  }));
  //Garbage collection handle
  addWindow.on('close', function(){
    addWindow= null;
  });
}

//Catch item:add
ipcMain.on('item:add',function(e,item){
  mainWindow.webContents.send('item:add', item);
  addWindow.close();
});

//Create menu template
const mainMenuTemplate = [
  {
    label:'File',
    submenu:[
      {
        label:'Add Item',
        click(){
        createAddWindow();
        }
      },
      {
        label:'Clear Items',
        click(){
          mainWindow.webContents.send('item:clear');
        }
      },
      {
        label:'Quit',
        accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click(){
          app.quit();
        }
      }
    ]
  }
];

//if mac, add empty object to the menu
if (process.platform == 'darwin') {
  mainMenuTemplate.unshift({});
}

//Add developer tools item if not in prod
if (process.env.NODE_ENV !== 'production') {
  mainMenuTemplate.push({
    label:'Developer Tools',
    submenu:[
      {
        label: 'Toggle DevTools',
        accelerator: process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
        click(item, focusedWindow){
          focusedWindow.toggleDevTools();
        }
      },
      {
        role: 'reload'
      }
    ]
  });
}