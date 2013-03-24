###
#
# Copyright 2013 OW2 Nanoko Project
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#   http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
###

###
# Utility methods used by H-UBU
###

HUBU.UTILS = HUBU.UTILS ? {}

# Create a private alias.
utils = HUBU.UTILS;

getGlobal().namespace = (target, name, block) ->
  [target, name, block] = [(if typeof exports isnt 'undefined' then exports else window), arguments...] if arguments.length < 3
  top    = target
  target = target[item] or= {} for item in name.split '.'
  block target, top


###
# Logger.
# If set will happend the logger name in from of all logged messages.
# The logger uses `window.console` or `global.console` to log messages. So if this object is not defined, the message are not logged.
# The logger defines the common logging methods: `debug`, `info`, `warn` and `error`.
# By default the log level is set to INFO, but can be adjusted using the `setLevel` method.
###
getGlobal().Logger = class Logger
  @DEBUG : 0
  @INFO : 1
  @WARNING : 2
  @ERROR : 3

  _header : ""
  _level : Logger.INFO

  constructor : (name = "") ->
    if (name.length > 0)
      m_header = "[#{name}] "

  _getConsole : ->
    if (window?.console?) then return window.console
    if (global?.console?) then return global.console
    return null

  log : (message) ->
    if (@_getConsole()?)
      @_getConsole().log("#{@_header}" + message)
      return true
    return false

  debug : (message) ->
    if @_level <= Logger.DEBUG
      return @log("DEBUG - " + message)
    return false


  info : (message) ->
    if @_level <= Logger.INFO
      return @log("INFO - " + message)
    return false

  warn : (message) ->
    if @_level <= Logger.WARNING
      return @log("WARN - " + message)
    return false

  error : (message) ->
    if @_level <= Logger.ERROR
      @log("ERROR - " + message)

  setLevel : (level) -> @_level = level

### End of Logger class  ###

# Main hubu logger.
HUBU.logger = new Logger("hubu")
logger = HUBU.logger;

getGlobal().Exception = class Exception
  data: {}

  constructor: (message) ->
    @message = message

  add: (key, value) -> @data.key = value; return @

  toString : -> return @message


###
# Contract and Reflection related methods
###

###*
# This function is returning the `type` of an object. It is different from the JavaScript `typeof`, and relies on
# the Object `toString` method.
# Here are the different results :
#
# *`typeOf(1)` => "number"
# *`typeOf({})` => "object"
# *`typeOf([])` => "array"
# *`typeOf(function() {})` => "function"
# *`typeOf(null)` => "null"
#
###
utils.typeOf = (obj) ->
  if not obj?
    return new String obj
  classToType = new Object
  for name in "Boolean Number String Function Array Date RegExp".split(" ")
    classToType["[object " + name + "]"] = name.toLowerCase()
  myClass = Object.prototype.toString.call obj
  if myClass of classToType
    return classToType[myClass]
  return "object"

###*
# Checks that the given object is conform to the given contract
# The contract is a javascript object.
# The conformity is computed as follow:
#
# `O is conform to C if and only if for all i in C where C[i] != null O[i] != null && typeof(C[i]) = typeOf(O[i])`
#
# This is an implementation of 'Chi':
# `Metamodel <- chi <- Model -> mu -> System`
# where chi is : isObjectConformToContract and mu is representationOf.
# @param object the object to check
# @param contract the contract
# @return true if the object is conform with the given contract, false otherwise.
###
utils.isObjectConformToContract = (object, contract) ->
  # For all 'properties' from contract, check that the object has an equivalent property
  for props of contract
    # We need to check that the property is defined on the given object.
    if not object[props]?
      logger.warn "Object not conform to contract - property #{props} missing"
      return false
    else
      # Check whether we have the right type
      if @typeOf(contract[props]) isnt (@typeOf object[props])
        logger.warn "Object not conform to contract - the type of the property #{props} does not match.
          Expected '" + @typeOf(contract[props]) + "' but found '" + @typeOf(object[props]) + "'"
        return false
  # We're done !
  return true

###*
# Utility method to check if the given object is a function.
# @param {Object} obj the object to check
# @returns `true` if the given object is a function, `false` otherwise
###
utils.isFunction = (ref) ->
  # We need to specify the exact function because toString can be overridden by browser.
  return @typeOf(ref) is "function";

###*
# Utility method to check if the given object is an object.
# @param {Object} obj the object to check
# @returns `true` if the given object is an object, `false` otherwise
###
utils.isObject = (ref) ->
  # We need to specify the exact function because toString can be overridden by browser.
  return @typeOf(ref) is "object";

###*
# Invokes the method `method` on the object `target` with the arguments `args` (Array).
# @param obj the instance
# @param method the method name to call
# @param args {Array} the arguments to pass to the method.
# @return either the result of the method. `false` if the method is not defined, or is not a function.
###
utils.invoke = (target, method, args) ->
  if (target[method]?  and @isFunction(target[method]))
    return target[method].apply(target, args)
  return false;

###*
# Extends the given object `obj` with the given function `func`. Basically, if the `obj[name]` is not defined, then
# this method extends `obj` with `obj[name]=func`
# If the method is added, the method returns `true`, `false` otherwise.
# @param obj the object
# @param name the name of the function to add
# @param func the function to append to the object
# @return {Boolean}
###
utils.defineFunctionIfNotExist = (obj, name, func) ->
  if (not obj[name]?)
    obj[name] = func
    return true
  return false

###*
# Clone an object (deep copy).
# @param obj {Object} the object to clone
# @param excludes {Array} the property to exclude.
# @return the cloned object, or the object itself if it's not an object.
###
utils.clone = (obj, excludes) ->
  if not obj? or typeof obj isnt 'object'
    return obj

  if obj instanceof Date
    return new Date(obj.getTime())

  if obj instanceof RegExp
    flags = ''
    flags += 'g' if obj.global?
    flags += 'i' if obj.ignoreCase?
    flags += 'm' if obj.multiline?
    flags += 'y' if obj.sticky?
    return new RegExp(obj.source, flags)

  newInstance = new obj.constructor()

  excludes = excludes ? []

  for key of obj when @indexOf(excludes, key) is -1
    newInstance[key] = @clone(obj[key], excludes)

  return newInstance

###*
# Creates a `bind` method. This method is calling the given `method` on the given `object`.
# For example, `bind(foo, doSomething)` returns a method like:
# `function() { return foo.doSomething(); }`
# @param {Object} the object on which the method will be called
# @param {Function} the function to call, is can be given as string too
# @return {Function} the wrapper function.
###
utils.bind = (obj, method) ->
  if @typeOf(method) is "string"
    if obj[method]?
      method = obj[method]
    else
      throw('HUBU.bind: obj[' + method + "] is null")

  if @typeOf(method) is "function"
    return ->
      return method.apply(obj, Array.prototype.slice.call(arguments))
  else
    throw('HUBU.bind: obj[' + method + "] is not a function")


###*
# Creates a proxy hiding the given object. The proxy implements the contract (and only the contract).
# @param {Object} contract the contract
# @param {Object} object the object to proxy
# @return the proxy
###
utils.createProxyForContract = (contract, object) ->
  proxy = {}

  # We inject the proxied object
  proxy.__proxy__ = object;
  for props of contract
    if @isFunction contract[props]
      model = contract[props]()
      bindedFunc = @bind(object, object[props])
      if not model?
        # To call the correct method, we create a new anonymous function
        # applying the arguments on the function itself
        # We use apply to pass all arguments, and set the target
        # The resulting method is stored using the method name in the
        # proxy object
        proxy[props] = bindedFunc
      else
        proxy[props] = utils.bindWithArguments(@, utils.paramChecker, model, bindedFunc)
    else
      # Everything else is just referenced.
      #TODO We could check component attributes types ...
      proxy[props] = object[props]

  return proxy;

###*
# Checks if the given component implements the 'component' protocol (i.e. interface).
# @param {Object} component the component to check
# @return `true` if this is a valid component, `false` otherwise.
###
utils.isComponent = (component) ->
  # if component is null, return false
  if (not component?)
    return false;
  return @isObjectConformToContract(component, new HUBU.AbstractComponent());

###*
# Checks wheter the given component is plugged on the given hub.
# The component can be given as string (component name) or as object (component object)
# @param {Object} or {String} component the component to check
# @param hub the hub
@ @return `true` is the component is plugged on the hub, `false` otherwise
###
utils.isComponentPlugged = (component, hub) ->
  if @typeOf(component) is "string"
    return hub.getComponent(component) isnt null

  if @typeOf(component) is "object"
    return @indexOf(hub.getComponents(), component) isnt -1

  return false

###*
# indexOf function.
# This method delegates on `Array.indexOf` if it exists. If not (IE), it just implements its own indexOf with simple
# lookup
# @param {Object} array the array
# @param {Object} obj the object
# @return the index of the object 'obj' in the array or -1 if not found.
###
utils.indexOf = (array, obj) ->
  # If the indexOf method is defined, use it
  if (Array.prototype.indexOf?)
    return array.indexOf(obj)
  else
    # Else, we do a simple lookup
    for v, i in array
      return i if v is obj
    return -1

###*
# Removes the object or value `obj` from the array `array`.
# Even if the array is modified in place, this method returns the final array.
# All occurence of `obj` are removed from the array
# @param array the array
# @param obj the reference to remove
# @return the final array
###
utils.removeElementFromArray = (array, obj) ->
  for v of array
    array.splice(v, 1) if array[v] is obj
  return array

###
# End of the contract and reflection related methods
###

###*
# Ensure that <b>inParam</b> is conform to <b>model</b> and call <b>oldFunc</b> if it's the case.
# @param [object] model object describing inParam allowed structure
# @param [function] {oldFunc} function to call in case inParam is conform to model.
# @param [object] inParam object to check against the model
# @return null
###
utils.paramChecker = (model, oldFunc, inParam)->
  #We assume old is already binded to its component from proxyfication
  if not model?
    throw "HUBU.checker: NO MODEL no model provided"

  #model provided but no input param => NOPE
  if not inParam?
    throw "HUBU.checker: NULL contract enforce inParam not to be null (#{inParam} found) and follow model #{model}"

  for field of model
    #One of the field in model is not present in input param => NOPE
    if not inParam[field]?
      throw "HUBU.checker: #{field} of inParam is not conform to model #{model}"
    #Object : Model define a recursion
    #Array : array of allowed types for this param
    switch utils.typeOf model[field]
      when "object"
        #Model define the field as object but inParam.field is not an object => NOPE
        if not utils.isObject(inParam[field])
          throw "HUBU.checker: BAD OBJECT #{field} of inParam is not conform to model #{model[field]}"
        #Recursion but oldFunc to null => only root check can launch oldFunc after completion
        utils.paramChecker model[field], null, inParam[field]
      when "array"
        #inParam[field] is not one of provided types => NOPE
        if not utils.isObjectFromTypes(inParam[field], model[field])
          throw "HUBU.checker: NOT TYPE #{field} of inParam is not conform to model #{model[field]}"

  #Valid parameter, calling delegate
  if oldFunc?
    oldFunc(inParam)
  return

### utils ###

###*
# Test an object agains an array of types. Types can be string, for base types, or a function, for classes.<br/>
# example : ["string", "array", scope.className]
# @param [object] obj object to test
# @param [array] types valid types array (string or function)
# @return [boolean] result is obj valid according to types
###
utils.isObjectFromTypes = (obj, types)->
  for type in types
    switch utils.typeOf type
      #simple types
      #TODO Need to handle array of type with a semantic like "array[string]".
      #TODO Si type contient "array" tenter une regexp array[(.*)] et valider le type récupéré sur les instances
      when "string"
        if utils.typeOf(obj) is type
          return true
      #classes
      when "function"
        if obj instanceof type
          return true
  return false

###*
# Similar to bind, but allow argument binding too
# example : bindWithArguments this, this.function, a, b
# a and b will always be passed to function with additianal parameters as 3rf, 4th .... parameters
# @param {Object} the object on which the method will be called
# @param {Function} the function to call, is can be given as string too
# @return {Function} the wrapper function.
###
utils.bindWithArguments = (obj, method) ->
  if not method?
    method = obj
    obj = null
  obj = obj ? window
  if utils.typeOf(method) is "string"
    if obj[method]?
      method = obj[method]
    else
      throw('HUBU.bindWithArguments: obj[' + method + "] is null")

  if utils.isFunction method
    args = utils.cloneArray(arguments, 2)

    return ->
      nargs = utils.cloneArray(arguments);
      return method.apply(obj, args.concat(nargs));
  else
    throw('HUBU.bindWithArguments: obj[' + method + "] is not a function")

###*
# Duplicate an array (but not cloning its values)
# @param [array] inArray array to duplicate
# @param [int] {inOffset} index where to start the clonde. Default : 0
# &param [array] {startWith] additional values to put in front of the cloned arrays
# @return [array] clone array
###
utils.cloneArray = (inArray, inOffset = 0, inStartWith = []) ->
  arr = inStartWith
  for element, i in inArray when i >= inOffset ? 0
    arr.push(element)
  return arr