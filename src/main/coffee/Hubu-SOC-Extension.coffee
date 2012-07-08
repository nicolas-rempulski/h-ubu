
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
      req.setServiceComponent(this)
      ps.onStart if @_state > ServiceComponent.STOPPED
      ps.onValidation if @_state is ServiceComponent.VALID
      ps.onInvalidation if @_state is ServiceComponent.INVALID

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
    if (@_state > oldState)
      @_validate()
    else if (@_state < oldState)
      @_invalidate()
    return @_state

  _validate : ->
    for prov in @_providedServices
      prov.onValidation()

  _invalidate : ->
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
    m_sate = ServiceComponent.STOPPED


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
          when SOC.ServiceEvent.MODIFIED_ENDMATCH then console.log("End match"); self._onServiceDeparture(event.getReference())
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
       HUBU.ServiceDependency.UNRESOLVED
     @_serviceComponent.computeState if oldState isnt @_state

  _onServiceArrival : (ref) ->
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
    @_hub.registerService = (component, contract, properties) -> return registry.registerService(component, contract, properties)
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
    @_hub.requireService = (description) -> return self.requireService(description)


  ### End of constructor  ###

  ###
  # The given component is unregistered from the hub. We needs to unregisters all services.
  ###
  unregisterComponent : (cmp) ->
    # Basics management
    @_registry.unregisterServices(cmp)

    # Stops all service component
    for entry in @_components when entry.component is cmp
      entry.serviceComponent.onStop()
      HUBU.UTILS.removeElementFromArray(@_components, entry)

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



  _addServiceDependencyToComponent : (comp, req) ->
    cmpEntry = entry for entry in @_components when entry.component is comp
    if not cmpEntry?
      cmpEntry = {'component' : comp, 'serviceComponent' : new HUBU.ServiceComponent()}
      @_components.push(cmpEntry)
    cmpEntry.serviceComponent.addRequiredService(req)
    if @_hub.isStarted() then cmpEntry.serviceComponent.onStart()

  start : ->
    # Starts all service component
    entry.serviceComponent.onStart() for entry in @_components

  stop : ->
    # Stops all service component
    entry.serviceComponent.onStop() for entry in @_components



### End of the Service Orientation Extension class  ###

# Declare the extension
getHubuExtensions().service =  ServiceOrientation
