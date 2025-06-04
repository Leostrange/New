/**
 * Мок-объекты для тестирования интеграции расширенных инструментов редактирования
 * с системой плагинов Mr.Comic
 */

// Мок-класс PluginManager
class MockPluginManager {
  constructor() {
    this.plugins = new Map();
    this.activePlugins = new Set();
    this.extensionPoints = new Map();
    this.eventListeners = new Map();
    this.permissionManager = null;
  }

  async initialize(context) {
    this.context = context;
    return true;
  }

  async registerPlugin(plugin) {
    if (!plugin.id) {
      throw new Error('Plugin ID is required');
    }
    
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with ID ${plugin.id} is already registered`);
    }
    
    this.plugins.set(plugin.id, plugin);
    return true;
  }

  async initializePlugin(pluginId, context) {
    const plugin = this.getPlugin(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin with ID ${pluginId} not found`);
    }
    
    if (typeof plugin.initialize === 'function') {
      await plugin.initialize(context);
    }
    
    return true;
  }

  async activatePlugin(pluginId) {
    const plugin = this.getPlugin(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin with ID ${pluginId} not found`);
    }
    
    if (typeof plugin.activate === 'function') {
      await plugin.activate();
    }
    
    this.activePlugins.add(pluginId);
    this.emit('plugin:activated', pluginId);
    
    return true;
  }

  async deactivatePlugin(pluginId) {
    const plugin = this.getPlugin(pluginId);
    
    if (!plugin) {
      throw new Error(`Plugin with ID ${pluginId} not found`);
    }
    
    if (typeof plugin.deactivate === 'function') {
      await plugin.deactivate();
    }
    
    this.activePlugins.delete(pluginId);
    this.emit('plugin:deactivated', pluginId);
    
    return true;
  }

  getPlugin(pluginId) {
    return this.plugins.get(pluginId);
  }

  getActivePlugins() {
    const activePlugins = [];
    
    for (const pluginId of this.activePlugins) {
      const plugin = this.getPlugin(pluginId);
      if (plugin) {
        activePlugins.push(plugin);
      }
    }
    
    return activePlugins;
  }

  registerExtensionPoint(pointId, options) {
    if (this.extensionPoints.has(pointId)) {
      throw new Error(`Extension point ${pointId} is already registered`);
    }
    
    this.extensionPoints.set(pointId, options);
    return true;
  }

  async executeExtensionPoint(pointId, data) {
    const extensionPoint = this.extensionPoints.get(pointId);
    
    if (!extensionPoint) {
      throw new Error(`Extension point ${pointId} not found`);
    }
    
    if (typeof extensionPoint.handler === 'function') {
      return await extensionPoint.handler(data);
    }
    
    return null;
  }

  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    
    this.eventListeners.get(event).push(listener);
    return this;
  }

  emit(event, ...args) {
    if (this.eventListeners.has(event)) {
      for (const listener of this.eventListeners.get(event)) {
        listener(...args);
      }
    }
    
    return true;
  }
}

// Мок-класс ToolManager
class MockToolManager {
  constructor() {
    this.tools = new Map();
  }

  async registerTool(tool) {
    if (!tool.id) {
      throw new Error('Tool ID is required');
    }
    
    if (this.tools.has(tool.id)) {
      throw new Error(`Tool with ID ${tool.id} is already registered`);
    }
    
    this.tools.set(tool.id, tool);
    
    if (typeof tool.initialize === 'function') {
      await tool.initialize();
    }
    
    return true;
  }

  async unregisterTool(toolId) {
    if (!this.tools.has(toolId)) {
      return false;
    }
    
    const tool = this.tools.get(toolId);
    
    if (typeof tool.dispose === 'function') {
      await tool.dispose();
    }
    
    this.tools.delete(toolId);
    return true;
  }

  getTool(toolId) {
    return this.tools.get(toolId);
  }

  hasTool(toolId) {
    return this.tools.has(toolId);
  }

  getTools() {
    return Array.from(this.tools.values());
  }
}

// Мок-класс BaseTool
class MockBaseTool {
  constructor(options = {}) {
    this.id = options.id || `tool_${Date.now()}`;
    this.type = options.type || 'base';
    this.name = options.name || 'Base Tool';
    this.description = options.description || 'Base tool description';
    this.category = options.category || 'general';
    this.capabilities = options.capabilities || [];
    this.active = false;
  }

  async initialize() {
    return true;
  }

  async dispose() {
    return true;
  }

  async activate() {
    this.active = true;
    if (typeof this._onActivate === 'function') {
      await this._onActivate();
    }
    return true;
  }

  async deactivate() {
    this.active = false;
    if (typeof this._onDeactivate === 'function') {
      await this._onDeactivate();
    }
    return true;
  }

  async executeCommand(command) {
    if (!this.canHandleCommand(command)) {
      throw new Error(`Command ${command.type} not supported by tool ${this.id}`);
    }
    
    if (typeof this._executeCommand === 'function') {
      return await this._executeCommand(command);
    }
    
    return null;
  }

  canHandleCommand(command) {
    return false;
  }
}

// Экспортируем мок-классы
module.exports = {
  MockPluginManager,
  MockToolManager,
  MockBaseTool
};
