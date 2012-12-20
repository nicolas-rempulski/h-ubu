###
# Hub Class
###


###*
 The Hub Class.
 @class HUBU.Hub
 @classdesc The main **Hub** class. Each instance of this class is a _hub_ and so is able to receive components.
 All components need to be plugged to a hub to be _active_. This is the central piece of the h-ubu system.
 Hub are also components so can be plugged to other hubs.
###
HUBU.Hub = class Hub
  ###*
  The component plugged to the hub.
  @type {Array}
  @memberOf HUBU.Hub
  @name #_components
  @private
  ###
  _components : null

  ###*
  Is the hub started.
  @name HUBU.Hub#_started
  @private
  ###
  _started : false

  ###*
  The list of extensions plugged on this hub.
  The extensions are created on the first hub access (either `start` or `registerComponent`)
  @name HUBU.Hub#_extensions
  @private
  ###
  _extensions : null

  ###*
  The parent hub, if set. The parent is given during the configure method.
  @name HUBU.Hub#_parentHub
  @private
  ###
  _parentHub : null

  ###*
  The hub name if set. `hub` by default. The root hub is named `root`.
  @name HUBU.Hub#_name
  @private
  ###
  _name : null

  ###*
  The hub constructor.
  ###
  constructor: ->
    @_components = []
    @_started = false
    @_extensions = null

  ###*
  Configures the hub. This method initializes all extensions if not already done.
  @method
  @name HUBU.Hub#configure
  @param {HUBU.Hub} parent the parent hub if exists. Sub-hubs have necessary one and only one parent hub.
  @param configuration optional parameter used to pass the component configuration. The configuration object is a simple
   key/value map.  @returns {HUBU.Hub} the hub
  ###
  configure: (parent, configuration) ->

    if (parent?)
      @_parentHub = parent

    if not @_name?
      @_name = if (configuration?.component_name?) then configuration.component_name else "hub"

    # Do not reinitialized if already initialized
    if not @_extensions?
      @_extensions = []
      for name,ext of getHubuExtensions()
        #HUBU.logger.info("Initializing new hub with the " + name + " extension")
        @_extensions.push(new ext(@))
    else
      HUBU.logger.debug("Hub already initialized")
    return this

  ###*
  Gets the parent hub if set
  @method
  @name HUBU.Hub#getParentHub
  @returns {boolean} the parent hub is set, `null` otherwise.
  ###
  getParentHub : -> @_parentHub


  ###*
  Gets all plugged components.
  *Do not modified the result !*
  @method
  @name HUBU.Hub#getComponents
  @return {Array} the list of plugged components on the current hub.
  ###
  getComponents: -> return @_components

  ###*
  Looks for one specific component plugged to the hub.
  This lookup is based on the component 'getComponentName' method.
  @method
  @name HUBU.Hub#getComponent
  @param {String} name the component name
  @return {HUBU.AbstractComponent} the component with the matching name or `null` if the component is not plugged.
  ###
  getComponent : (name) ->
    # If name is null, return null
    if ! name?
      return null

    for cmp in @_components
      # Check that we have the getComponentName function
      fc = cmp.getComponentName;
      if fc? and HUBU.UTILS.isFunction(fc)
        n = fc.apply(cmp, []); # Invoke the method.
        if n is name
          # Only one match, just return.
          return cmp

    # Not found.
    return null

  ###*
  Registers a new component on the hub.
  If the component already exists, the registration is ignored. The lookup is based on the `getComponentName` method.
  This method allows to configure the component.Once successfully registered, the hub call the 'configure' method on
  the component passing a reference on the hub and the configuration to the component.
  If component is `null`, the method throws an exception.
  @method
  @name HUBU.Hub#registerComponent
  @param {HUBU.AbstractComponent} component the component to register
  @param {Object} configuration the component configuration (optional).
  If the configuration contain the `component_name` key, the component takes this name.
  @return {HUBU.Hub} the current hub
  ###
  registerComponent : (component, configuration) ->
    ### Validation ###
    if !component?
      throw new Exception("Cannot register component - component is null")

    # Check the validity of the component.
    if ! HUBU.UTILS.isComponent(component)
      if (component.getComponentName)
        throw new Exception(component.getComponentName() + " is not a valid component")
      else
        throw new Exception(component + " is not a valid component")
    ### End of Validation ###

    # Initialize the hub if not done already
    @configure() unless @_extensions isnt null

    # First check that we don't have already this component
    # We can call getComponentName as we have check the component
    if @getComponent(component.getComponentName())?
      # If the component is already plugged, we return immediately
      HUBU.logger.info("Component " + component.getComponentName() + " already registered")
      return @ # Return the hub.

    # Add the component at the end of the list.
    @_components.push(component)

    # Manage component_name
    if (configuration? && configuration.component_name?)
      # Set a field containing the name
      component["__name__"] = configuration.component_name
      # Replace the method.
      component.getComponentName = -> return this["__name__"]

    # Inject the hub.
    if (not component.__hub__? and not component.hub?)
      component.__hub__ = @;
      component.hub = -> return this.__hub__

    HUBU.logger.debug("Registering component " + component.getComponentName())
    # Notify extensions
    for ext in @_extensions
      HUBU.UTILS.invoke(ext, "registerComponent", [component, configuration])

    # Call configure on the component, we pass the current hub
    HUBU.logger.debug("Configuring component " + component.getComponentName())
    component.configure(this, configuration)

    # If we're already started, call start

    if @_started
      HUBU.logger.debug("Starting component " + component.getComponentName())
      component.start()

    HUBU.logger.debug("Component " + component.getComponentName() + " registered")
    # Return the current hub
    return @

  ###*
  Unregisters the given component.
  If the component is not plugged to the hub, this method does nothing.
  @name HUBU.Hub#unregisterComponent
  @method
  @param {Object} component either the component object ({HUBU.AbstractComponent}) or the component name {String}
  @return {HUBU.Hub} the current hub.
  ###
  unregisterComponent : (component) ->
    # If component is null, return immediately
    if not component?
      return @;

    cmp = null
    if HUBU.UTILS.typeOf(component) is "string"
      cmp = this.getComponent(component);
      # If the component is not plugged, exit immediately
      if not cmp? then return @
    else
      if not HUBU.UTILS.isComponent(component)
        throw new Exception("Cannot unregister component, it's not a valid component").add("component", component)
      else cmp = component

    # Initialize the hub if not done already
    @configure() unless @_extensions isnt null

    # Iterate on the components array to find the component to unregister.
    idx = HUBU.UTILS.indexOf(@_components, cmp); # Find the index
    if idx isnt -1
      # Remove it if really found
      # Notify all extensions
      for ext in @_extensions
        HUBU.UTILS.invoke(ext, "unregisterComponent", [cmp]);
      # Call stop on the component
      cmp.stop();
      @_components.splice(idx, 1);
    else
      HUBU.logger.info("Component " + cmp.getComponentName() + " not unregistered - not on the hub")
    return @

  ###*
  Starts the hub.
  This method calls start on all plugged components.
  This method does nothing is the hub is already started.
  @method
  @name HUBU.Hub#start
  @return {HUBU.Hub} the hub
  ###
  start : ->
    if @_started then return @

    # Initialize the hub if not done already
    @configure() unless @_extensions isnt null

    # Notify extensions
    HUBU.UTILS.invoke(ext, "start", []) for ext in @_extensions

    @_started = true;
    for cmp in @_components
      # Only valid component can be plugged, so we can call start directly.
      cmp.start()

    return @

  ###*
  Stops the hub.
  This method calls stop on all plugged components.
  If the hub is not started, this methods does nothing.
  @method
  @name HUBU.Hub#stop
  @return {HUBU.Hub} the hub
  ###
  stop : ->
    if not @_started then return @

    @_started = false;

    for cmp in @_components
      # Only valid component can be plugged, so we can call stop directly.
      cmp.stop()

    # Notify extensions
    HUBU.UTILS.invoke(ext, "start", []) for ext in @_extensions

    return @

  ###*
  Checks whether the hub is started.
  @method
  @name HUBU.Hub#isStarted
  @return {boolean} `true` is the hub is started, `false` otherwise
  ###
  isStarted : -> return @_started

  ###*
  Resets the hub.
  This method is generally used for testing as it reinitializes the hub state.
  @method
  @name HUBU.Hub#reset
  @return {HUBU.Hub} the current hub
  ###
  reset: ->
    @stop()

    # Store the name
    name = @_name

    @configure() unless @_extensions isnt null

    for ext in @_extensions
      HUBU.UTILS.invoke(ext, "reset", []);

    @_components = []
    @_extensions = null
    # Restore the name
    @_name = name

    return @

  ###*
  Gets the hub name.
  @name HUBU.Hub#getComponentName
  @method
  @return {String} the hub's name
  ###
  getComponentName : -> return @_name;

### End of th Hub Class ###

###*
Create the main Global hub, and the `hub` alias
@desc The main global hub.
@global
@readonly
###
getGlobal().hub = new HUBU.Hub().configure(null, { component_name : "root" })
