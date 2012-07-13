
###
# Hubu Service-Orientation Extension
###

HUBU.ServiceComponent = class ServiceComponent
  @STOPPED : 0
  @INVALID : 1
  @VALID : 2

  _component : null
  _providedServices : null
  _requiredServices : null
  _state : 0

  constructor : (component) ->
    @_component = component
    @_providedServices = []
    @_requiredServices = []
    @_state = ServiceComponent.STOPPED

  getComponent : ->
    return @_component

  getState : ->
    return @_state

  addProvidedService : (ps) ->
    if HUBU.UTILS.indexOf(@_providedServices, ps) is -1
      @_providedServices.push(ps)
      ps.setServiceComponent(this)
      ps.onStart() if @_state > ServiceComponent.STOPPED
      ps.onValidation() if @_state is ServiceComponent.VALID
      ps.onInvalidation() if @_state is ServiceComponent.INVALID

  removeProvidedService : (ps) ->
    if HUBU.UTILS.indexOf(@_providedServices, ps) isnt -1
      HUBU.UTILS.removeElementFromArray(@_providedServices, ps)
      ps.onStop()

  addRequiredService : (req) ->
    if HUBU.UTILS.indexOf(@_requiredServices, req) is -1
      @_requiredServices.push(req)
      req.setServiceComponent(this)
      if @_state > ServiceComponent.STOPPED  then req.onStart(); @computeState()

  removeRequireService : (req) ->
    if (HUBU.UTILS.indexOf(@_requiredServices, req) > -1)
      HUBU.UTILS.removeElementFromArray(@_requiredServices, req)
      req.onStop()
      @computeState() if @_state > ServiceComponent.STOPPED


  computeState : ->
    isValid = true
    for req in @_requiredServices
      isValid = isValid  and req.isValid()
    oldState = @_state
    @_state = if isValid then ServiceComponent.VALID else ServiceComponent.INVALID
    if (@_state > oldState  && @_state is ServiceComponent.VALID)
      @_validate()
    else if (@_state < oldState  && @_state is ServiceComponent.INVALID)
      @_invalidate()
    return @_state

  _validate : ->
    HUBU.logger.debug("Validate instance " + @_component?.getComponentName())
    for prov in @_providedServices
      prov.onValidation()

  _invalidate : ->
    HUBU.logger.debug("Invalidate instance")
    for prov in @_providedServices
      prov.onInvalidation()

  onStart : ->
    # Start the dependencies first
    req.onStart() for req in @_requiredServices
    prov.onStart() for prov in @_providedServices
    @computeState()

  onStop : ->
    prov.onStop() for prov in @_providedServices
    req.onStop() for req in @_requiredServices
    @_state = ServiceComponent.STOPPED


HUBU.ServiceDependency = class ServiceDependency
  @UNRESOLVED = 0
  @RESOLVED = 1

  _component : null

  _contract : null
  _filter : null
  _aggregate : false
  _optional : false
  _field : null
  _bind : null
  _unbind : null

  _hub : null

  _listener = null
  _state = null

  _refs = []

  _serviceComponent = null

  constructor: (component, contract, filter, aggregate, optional, field, bind, unbind, hub) ->
    @_component = component
    @_contract = contract
    @_filter = filter
    @_aggregate = aggregate
    @_optional = optional

    @_field = field

    if bind?
      @_bind = if HUBU.UTILS.isFunction(bind) then bind else @_component[bind]
      if not @_bind? then throw new Exception("Bind method " + bind + " not found on component")

    if unbind?
      @_unbind = if HUBU.UTILS.isFunction(unbind) then unbind else @_component[unbind]
      if not @_unbind? then throw new Exception("Unbind method " + unbind + " not found on component")

    @_hub = hub
    @_state = HUBU.ServiceDependency.UNRESOLVED
    @_refs = []
    self = this
    @_listener = {
      contract: @_contract,
      filter : @_filter,
      listener : (event) ->
        switch event.getType()
          when SOC.ServiceEvent.REGISTERED then self._onServiceArrival(event.getReference())
          when SOC.ServiceEvent.MODIFIED then self._onServiceModified(event.getReference())
          when SOC.ServiceEvent.UNREGISTERING then self._onServiceDeparture(event.getReference())
          when SOC.ServiceEvent.MODIFIED_ENDMATCH then self._onServiceDeparture(event.getReference())
    }
  ### End Constructor ###

  setServiceComponent : (sc) -> @_serviceComponent = sc

  onStart : ->
    @_state = HUBU.ServiceDependency.UNRESOLVED
    @_startTracking()
    @_computeDependencyState()

  onStop : ->
    @_stopTracking()
    @_ungetAllServices()
    @_refs = []
    @_state = HUBU.ServiceDependency.UNRESOLVED

  _ungetAllServices : ->
    for entry in @_refs when entry.service?
      entry.service = null
      @_hub.ungetService(@_component, entry.reference)

  _startTracking : ->
    # Register service listener
    @_hub.registerServiceListener(@_listener)
    # Immadiate / Defensive get
    refs = @_hub.getServiceReferences(@_contract, @_filter)
    @_onServiceArrival ref for ref in refs

  _stopTracking : ->
    # Remove listeners
    @_hub.unregisterServiceListener(@_listener)

  isValid : -> return @_state is HUBU.ServiceDependency.RESOLVED

  _computeDependencyState : ->
     oldState = @_state
     if @_optional or @_refs.length > 0
        @_state = HUBU.ServiceDependency.RESOLVED
     else
       @_state = HUBU.ServiceDependency.UNRESOLVED
     @_serviceComponent.computeState() if oldState isnt @_state

  _onServiceArrival : (ref) ->
    HUBU.logger.debug("Service arrival detected for " + @_component.getComponentName());
    # Do we already have this reference
    refEntry = entry for entry in @_refs when entry.reference is ref
    if not refEntry?
      refEntry = {
        reference: ref,
        service: null
      }
      @_refs.push(refEntry)

      @_computeDependencyState()
      if @_aggregate
        @_inject(refEntry)
      else
        @_inject(refEntry) if @_refs.length is 1

  _onServiceDeparture : (ref) ->
    HUBU.logger.debug("Service departure detected for " + @_component.getComponentName());
    # Do we already have this reference
    refEntry = entry for entry in @_refs when entry.reference is ref
    if refEntry?
      HUBU.UTILS.removeElementFromArray(@_refs, refEntry)
      if refEntry.service? # Used service
        @_deinject(refEntry)
        @_hub.ungetService(@_component, ref)
        refEntry.service = null

      # Do we have another reference
      if (@_refs.length > 0)
        newRef = @_refs[0]
        # Inject the reference on non aggregated dependencies
        @_inject newRef if not @_aggregate
      else
        # No ref... we may be UNRESOLVED.
        @_computeDependencyState()

  _onServiceModified : (ref) ->
    # A service was modified, we now that we're matching. So, either we already have the ref, in that case we do nothing
    # or it's a new service, and we consider it as an arrival
    refEntry = entry for entry in @_refs when entry.reference is ref
    if not refEntry?
      @_onServiceArrival(ref)

  _inject : (entry) ->
    # Get the service
    svc = @_hub.getService(@_serviceComponent, entry.reference)
    entry.service = svc

    # Field injection first
    if @_field?  and @_aggregate
        if not @_component[@_field]? then @_component[@_field] = [svc] else @_component[@_field].push(svc)
    if @_field? and not @_aggregate then @_component[@_field] = svc

    # Bind
    if @_bind? then @_bind.apply(@_component, [svc, entry.reference])

  _deinject : (entry) ->
    if @_field?  and @_aggregate
      HUBU.UTILS.removeElementFromArray(@_component[@_field], entry.service)
    if @_field? and not @_aggregate then @_component[@_field] = null

    # UnBind
    if @_unbind? then @_unbind.apply(@_component, [entry.service, entry.reference])


HUBU.ProvidedService = class ProvidedService
  @UNREGISTERED : 0
  @REGISTERED : 1

  _hub : null
  _contract : null
  _properties : null

  _registration : null
  _serviceComponent : null
  _component : null

  _preRegistration : null
  _postRegistration : null
  _preUnregistration : null
  _postUnRegistration : null

  constructor : (component, contract, properties, preRegistration, postRegistration, preUnregistration, postUnregistration, hub) ->
    @_component = component
    @_contract = contract
    @_hub = hub
    @_properties = properties

    if preRegistration?
      @_preRegistration = if HUBU.UTILS.isFunction(preRegistration) then preRegistration else @_component[preRegistration]
      if not @_preRegistration? then throw new Exception("preRegistration method " + preRegistration + " not found on component")

    if postRegistration?
      @_postRegistration = if HUBU.UTILS.isFunction(postRegistration) then postRegistration else @_component[postRegistration]
      if not @_postRegistration? then throw new Exception("postRegistration method " + postRegistration + " not found on component")

    if preUnregistration?
      @_preUnregistration = if HUBU.UTILS.isFunction(preUnregistration) then preUnregistration else @_component[preUnregistration]
      if not @_preUnregistration? then throw new Exception("preUnregistration method " + preUnregistration + " not found on component")

    if postUnregistration?
      @_postUnRegistration = if HUBU.UTILS.isFunction(postUnregistration) then postUnregistration else @_component[postUnregistration]
      if not @_postUnRegistration? then throw new Exception("postUnregistration method " + postUnregistration + " not found on component")

  setServiceComponent : (sc) -> @_serviceComponent = sc

  _register : ->
    # Already registered
    if @_registration? then return false

    if (@_preRegistration?) then @_preRegistration.apply(@_component, [])
    proxy = HUBU.UTILS.createProxyForContract(@_contract, @_component)
    @_registration = @_hub.registerService(@_component, @_contract, @_properties, proxy)
    HUBU.logger.debug("Service from " + @_component.getComponentName() + " registered");
    if (@_postRegistration?) then @_postRegistration.apply(@_component, [@_registration])

    return true

  _unregister : ->
    if not @_registration? then return false

    if @_preUnregistration? then @_preUnregistration.apply(@_component, [@_registration])

    @_hub.unregisterService(@_registration)
    @_registration = null

    if @_postUnRegistration? then @_postUnRegistration.apply(@_component, [])

  onStart : ->
    # Do nothing.

  onStop : ->
    @_unregister()

  onValidation : -> @_register()

  onInvalidation : -> @_unregister()


HUBU.ServiceOrientation = class ServiceOrientation
  _hub : null
  _registry : null

  ###
  # An array of { component -> service component }.
  # To keep things simple, a component can have only one service component
  ###
  _components : []

  constructor : (hubu) ->
    @_hub  = hubu
    @_registry = new SOC.ServiceRegistry(@_hub)
    @_components = []
    registry = @_registry # Just created a variable put in the closure of the hub function.
    self = this

    # Populate the hub object
    @_hub.getServiceRegistry = -> return registry
    @_hub.registerService = (component, contract, properties, svcObject) -> return registry.registerService(component, contract, properties, svcObject)
    @_hub.unregisterService = (registration) -> return registry.unregisterService(registration)
    @_hub.getServiceReferences = (contract, filter) -> return registry.getServiceReferences(contract, filter)
    @_hub.getServiceReference = (contract, filter) ->
      refs = registry.getServiceReferences(contract, filter)
      if refs.length isnt 0 then return refs[0]
      return null
    @_hub.getService = (component, reference) -> return registry.getService(component, reference)
    @_hub.ungetService = (component, reference) -> return registry.ungetService(component, reference)
    @_hub.registerServiceListener = (listenerConfiguration) -> return registry.registerServiceListener(listenerConfiguration)
    @_hub.unregisterServiceListener = (listenerConfiguration) -> return registry.unregisterServiceListener(listenerConfiguration)

    # Service-oriented component model methods
    @_hub.requireService = (description) ->
      self.requireService(description);
      return this;
    @_hub.provideService = (description) ->
      self.provideService(description);
      return this;

  ### End of constructor  ###

  ###
  # The given component is unregistered from the hub. We needs to unregisters all services.
  ###
  unregisterComponent : (cmp) ->
    # We must start by the service components, as they may unregister the service themselves
    # and do some cleanup.
    # Stops all service components
    for entry in @_components when entry.component is cmp
      entry.serviceComponent.onStop()
      HUBU.UTILS.removeElementFromArray(@_components, entry)
    # Basics management
    @_registry.unregisterServices(cmp)


  requireService : (description) ->
    {component, contract, filter, aggregate, optional, field, bind, unbind} = description
    if not component? then throw new Exception("Cannot require a service without a valid component")
    aggregate = false unless aggregate?
    optional = false unless optional?
    contract = null unless contract?
    filter = null unless filter?
    if not field? and not bind? then throw new Exception("Cannot require a service - field or bind must be set")
    field = null unless field?
    bind = null unless bind?
    unbind = null unless unbind?
    req = new HUBU.ServiceDependency(component, contract, filter, aggregate, optional, field, bind, unbind, @_hub)
    @_addServiceDependencyToComponent(component, req)

  provideService : (description) ->
    {component, contract, properties, preRegistration, postRegistration, preUnregistration, postUnregistration} = description
    if not component? then throw new Exception("Cannot provided a service without a valid component")
    if not contract? then throw new Exception("Cannot provided a service without a valid contract")


    properties = {} unless properties?
    ps = new HUBU.ProvidedService(component, contract, properties, preRegistration, postRegistration, preUnregistration, postUnregistration, @_hub)
    @_addProvidedServiceToComponent(component, ps)



  _addServiceDependencyToComponent : (comp, req) ->
    newComponent = false
    cmpEntry = entry for entry in @_components when entry.component is comp
    if not cmpEntry?
      cmpEntry = {'component' : comp, 'serviceComponent' : new HUBU.ServiceComponent(comp)}
      @_components.push(cmpEntry)
      newComponent = true
    cmpEntry.serviceComponent.addRequiredService(req)
    if newComponent and @_hub.isStarted() then cmpEntry.serviceComponent.onStart()

  _addProvidedServiceToComponent : (comp, ps) ->
    newComponent = false
    cmpEntry = entry for entry in @_components when entry.component is comp
    if not cmpEntry?
      cmpEntry = {'component' : comp, 'serviceComponent' : new HUBU.ServiceComponent(comp)}
      @_components.push(cmpEntry)
      newComponent = true
    cmpEntry.serviceComponent.addProvidedService(ps)
    if @_hub.isStarted() and newComponent
      cmpEntry.serviceComponent.onStart()

  start : ->
    # Starts all service component
    entry.serviceComponent.onStart() for entry in @_components

  stop : ->
    # Stops all service component
    entry.serviceComponent.onStop() for entry in @_components



### End of the Service Orientation Extension class  ###

# Declare the extension
getHubuExtensions().service =  ServiceOrientation
