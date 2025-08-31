// Hello World Plugin for Mr.Comic
// This is a simple example plugin that demonstrates the plugin system

// Plugin initialization
(function() {
    // Register event handler for when a comic is opened
    const handlerId = PluginApi.registerEventHandler('COMIC_OPENED', function(data) {
        // Show a notification when a comic is opened
        PluginApi.showNotification('Hello from Hello World Plugin!', 'SUCCESS', 3000);
        
        // Log the event
        PluginApi.log('Comic opened: ' + data.comicId, 'INFO');
    });
    
    // Add a button to the UI
    const buttonId = PluginApi.addUiElement({
        type: 'BUTTON',
        text: 'Hello Plugin',
        onClick: function() {
            // Show a notification when the button is clicked
            PluginApi.showNotification('Hello World Plugin Button Clicked!', 'INFO', 2000);
            
            // Get current comic info
            const comicInfo = PluginApi.getCurrentComicInfo();
            if (comicInfo) {
                PluginApi.log('Current comic: ' + comicInfo.title, 'INFO');
            }
        }
    });
    
    // Store some data
    PluginApi.setPluginData('greeting', 'Hello from the plugin!');
    
    // Log plugin initialization
    PluginApi.log('Hello World Plugin initialized', 'INFO');
})();