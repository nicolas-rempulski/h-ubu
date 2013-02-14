/*
 * Copyright 2013 OW2 Nanoko Project
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function() {
  /*
  # Detects whether we exports on the Commons.js `exports` object or on `this` (so the Browser `window` object).
  */
  var global, _ref, _ref2;
  global = typeof exports !== "undefined" && exports !== null ? exports : this;
  global.HUBU = (_ref = global.HUBU) != null ? _ref : {};
  /*
  # Extension factory placeholder.
  # Contains tuple `extension name -> contructor function`
  */
  HUBU.extensions = (_ref2 = HUBU.extensions) != null ? _ref2 : {};
  global.getHubu = function() {
    return HUBU;
  };
  global.getHubuExtensions = function() {
    return HUBU.extensions;
  };
  global.getGlobal = function() {
    return global;
  };
}).call(this);

(function() {
  /*
  # Abstract Component class
  */
  /*
  # Abstract Component class.
  # This used is not intended to be used directly, and is just here for documentation purpose.
  # Indeed, the returned object contains the four required methods that <bold>all</bold> component must
  # have. Any Javascript object with those 4 methods can be cosidered as a valid component.
  # The four required methods are:
  #
  # * `getComponentName()` : return the default component name
  # * `configurate(hub, [configuration])` : configures the component
  # * `start()` / `stop()` : called when the component is started / stopped
  # 
  # Returned objects do not intend to be used, they are just mock / empty instances.
  */
  var AbstractComponent;
  HUBU.AbstractComponent = AbstractComponent = (function() {
    function AbstractComponent() {}
    /*
      # Configures the component.
      # This method is called by the hub when the component starts or
      # when the component is plugged when the hub is already started.
      # @param hub the hub
      # @param configuration optional parameter used to pass the component configuration. The configuration object is
      # a simple key/value map.
      # @public
      */
    AbstractComponent.prototype.configure = function(hub, configuration) {
      throw "AbstractComponent is an abstract class";
      /*
        # Starts the component.
        # This method is called by the hub when the hub starts or when the component is plugged when the hub is already started.
        # This methods is always called after the `configure` method.
        # Once called the component can send events and used bound components.
        */
    };
    AbstractComponent.prototype.start = function() {
      throw "AbstractComponent is an abstract class";
      /*
        # Stops the component.
        # This method is called by the hub when the hub is stopped or when the component is unplugged.
        # This methods is always called after the `start` method.
        # Once called, the component must not send events or access bound components.
        */
    };
    AbstractComponent.prototype.stop = function() {
      throw "AbstractComponent is an abstract class";
      /*
        # Gets the component name.
        # If an 'id' is given in the hub configuration, this method is replaced.
        # @return the component name
        # @public
        */
    };
    AbstractComponent.prototype.getComponentName = function() {
      throw "AbstractComponent is an abstract class";
    };
    return AbstractComponent;
  })();
}).call(this);

(function() {
  /*
  # Utility methods used by H-UBU
  */
  var Exception, Logger, logger, utils, _ref;
  var __slice = Array.prototype.slice;
  HUBU.UTILS = (_ref = HUBU.UTILS) != null ? _ref : {};
  utils = HUBU.UTILS;
  getGlobal().namespace = function(target, name, block) {
    var item, top, _i, _len, _ref2, _ref3;
    if (arguments.length < 3) {
      _ref2 = [(typeof exports !== 'undefined' ? exports : window)].concat(__slice.call(arguments)), target = _ref2[0], name = _ref2[1], block = _ref2[2];
    }
    top = target;
    _ref3 = name.split('.');
    for (_i = 0, _len = _ref3.length; _i < _len; _i++) {
      item = _ref3[_i];
      target = target[item] || (target[item] = {});
    }
    return block(target, top);
  };
  /*
  # Logger.
  # If set will happend the logger name in from of all logged messages.
  # The logger uses `window.console` to log messages. So if this object is not defined, the message are not logged.
  # The logger defines the common logging methods: `debug`, `info`, `warn` and `error`.
  # By default the log level is set to INFO, but can be adjusted using the `setLevel` method.
  */
  getGlobal().Logger = Logger = (function() {
    Logger.DEBUG = 0;
    Logger.INFO = 1;
    Logger.WARNING = 2;
    Logger.ERROR = 3;
    Logger.prototype._header = "";
    Logger.prototype._level = Logger.INFO;
    function Logger(name) {
      var m_header;
      if (name == null) {
        name = "";
      }
      if (name.length > 0) {
        m_header = "[" + name + "] ";
      }
    }
    Logger.prototype.log = function(message) {
      if ((window.console != null)) {
        window.console.log(("" + this._header) + message);
        return true;
      }
      return false;
    };
    Logger.prototype.debug = function(message) {
      if (this._level <= Logger.DEBUG) {
        return this.log("DEBUG - " + message);
      }
      return false;
    };
    Logger.prototype.info = function(message) {
      if (this._level <= Logger.INFO) {
        return this.log("INFO - " + message);
      }
      return false;
    };
    Logger.prototype.warn = function(message) {
      if (this._level <= Logger.WARNING) {
        return this.log("WARN - " + message);
      }
      return false;
    };
    Logger.prototype.error = function(message) {
      if (this._level <= Logger.ERROR) {
        return log("ERROR - " + message);
      }
    };
    Logger.prototype.setLevel = function(level) {
      return this._level = level;
    };
    return Logger;
  })();
  /* End of Logger class  */
  HUBU.logger = new Logger("hubu");
  logger = HUBU.logger;
  getGlobal().Exception = Exception = (function() {
    Exception.prototype.data = {};
    function Exception(message) {
      this.message = message;
    }
    Exception.prototype.add = function(key, value) {
      this.data.key = value;
      return this;
    };
    Exception.prototype.toString = function() {
      return this.message;
    };
    return Exception;
  })();
  /*
  # Contract and Reflection related methods
  */
  /*
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
  */
  utils.typeOf = function(obj) {
    var classToType, myClass, name, _i, _len, _ref2;
    if (!(obj != null)) {
      return String(obj);
    }
    classToType = new Object;
    _ref2 = "Boolean Number String Function Array Date RegExp".split(" ");
    for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
      name = _ref2[_i];
      classToType["[object " + name + "]"] = name.toLowerCase();
    }
    myClass = Object.prototype.toString.call(obj);
    if (myClass in classToType) {
      return classToType[myClass];
    }
    return "object";
  };
  /*
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
  */
  utils.isObjectConformToContract = function(object, contract) {
    var props;
    for (props in contract) {
      if (!(object[props] != null)) {
        logger.warn("Object not conform to contract - property " + props + " missing");
        return false;
      } else {
        if (this.typeOf(contract[props]) !== (this.typeOf(object[props]))) {
          logger.warn(("Object not conform to contract - the type of the property " + props + " does not match.          Expected '") + this.typeOf(contract[props]) + "' but found '" + this.typeOf(object[props]) + "'");
          return false;
        }
      }
    }
    return true;
  };
  /*
  # Utility method to check if the given object is a function.
  # @param {Object} obj the object to check
  # @returns `true` if the given object is a function, `false` otherwise
  */
  utils.isFunction = function(ref) {
    return this.typeOf(ref) === "function";
  };
  /*
  # Utility method to check if the given object is an object.
  # @param {Object} obj the object to check
  # @returns `true` if the given object is an object, `false` otherwise
  */
  utils.isObject = function(ref) {
    return this.typeOf(ref) === "object";
  };
  /*
  # Invokes the method `method` on the object `target` with the arguments `args` (Array).
  # @param obj the instance
  # @param method the method name to call
  # @param args {Array} the arguments to pass to the method.
  # @return either the result of the method. `false` if the method is not defined, or is not a function.
  */
  utils.invoke = function(target, method, args) {
    if ((target[method] != null) && this.isFunction(target[method])) {
      return target[method].apply(target, args);
    }
    return false;
  };
  /*
  # Extends the given object `obj` with the given function `func`. Basically, if the `obj[name]` is not defined, then
  # this method extends `obj` with `obj[name]=func`
  # If the method is added, the method returns `true`, `false` otherwise.
  # @param obj the object
  # @param name the name of the function to add
  # @param func the function to append to the object
  # @return {Boolean}
  */
  utils.defineFunctionIfNotExist = function(obj, name, func) {
    if (!(obj[name] != null)) {
      obj[name] = func;
      return true;
    }
    return false;
  };
  /*
  # Clone an object (deep copy).
  # @param obj {Object} the object to clone
  # @param excludes {Array} the property to exclude.
  # @return the cloned object, or the object itself if it's not an object.
  */
  utils.clone = function(obj, excludes) {
    var flags, key, newInstance;
    if (!(obj != null) || typeof obj !== 'object') {
      return obj;
    }
    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }
    if (obj instanceof RegExp) {
      flags = '';
      if (obj.global != null) {
        flags += 'g';
      }
      if (obj.ignoreCase != null) {
        flags += 'i';
      }
      if (obj.multiline != null) {
        flags += 'm';
      }
      if (obj.sticky != null) {
        flags += 'y';
      }
      return new RegExp(obj.source, flags);
    }
    newInstance = new obj.constructor();
    excludes = excludes != null ? excludes : [];
    for (key in obj) {
      if (this.indexOf(excludes, key) === -1) {
        newInstance[key] = this.clone(obj[key], excludes);
      }
    }
    return newInstance;
  };
  utils.bind = function(obj, method) {
    return function() {
      return method.apply(obj, Array.prototype.slice.call(arguments));
    };
  };
  /*
  # Creates a proxy hiding the given object. The proxy implements the contract (and only the contract).
  # @param {Object} contract the contract
  # @param {Object} object the object to proxy
  # @return the proxy
  */
  utils.createProxyForContract = function(contract, object) {
    var props, proxy;
    proxy = {};
    proxy.__proxy__ = object;
    for (props in contract) {
      if (this.isFunction(contract[props])) {
        proxy[props] = this.bind(object, object[props]);
      } else {
        proxy[props] = object[props];
      }
    }
    return proxy;
  };
  /*
  # Checks if the given component implements the 'component' protocol (i.e. interface).
  # @param {Object} component the component to check
  # @return `true` if this is a valid component, `false` otherwise.
  */
  utils.isComponent = function(component) {
    if (!(component != null)) {
      return false;
    }
    return this.isObjectConformToContract(component, new HUBU.AbstractComponent());
  };
  /*
  # Checks wheter the given component is plugged on the given hub.
  # The component can be given as string (component name) or as object (component object)
  # @param {Object} or {String} component the component to check
  # @param hub the hub
  @ @return `true` is the component is plugged on the hub, `false` otherwise
  */
  utils.isComponentPlugged = function(component, hub) {
    if (this.typeOf(component) === "string") {
      return hub.getComponent(component) !== null;
    }
    if (this.typeOf(component) === "object") {
      return this.indexOf(hub.getComponents(), component) !== -1;
    }
    return false;
  };
  /*
  # indexOf function.
  # This method delegates on `Array.indexOf` if it exists. If not (IE), it just implements its own indexOf with simple
  # lookup
  # @param {Object} array the array
  # @param {Object} obj the object
  # @return the index of the object 'obj' in the array or -1 if not found.
  */
  utils.indexOf = function(array, obj) {
    var v;
    if ((Array.prototype.indexOf != null)) {
      return array.indexOf(obj);
    } else {
      for (v in array) {
        if (array.v === obj) {
          return v;
        }
      }
      return -1;
    }
  };
  /*
  # Removes the object or value `obj` from the array `array`.
  # Even if the array is modified in place, this method returns the final array.
  # All occurence of `obj` are removed from the array
  # @param array the array
  # @param obj the reference to remove
  # @return the final array
  */
  utils.removeElementFromArray = function(array, obj) {
    var v;
    for (v in array) {
      if (array[v] === obj) {
        array.splice(v, 1);
      }
    }
    return array;
  };
  /*
  # End of the contract and reflection related methods
  */
}).call(this);

(function() {
  /*
  # Hubu Eventing Extension
  # This extension manages the event communications between components.
  # It is recommended to use `topics` instead of direct events.
  */
  var Eventing;
  var __slice = Array.prototype.slice;
  HUBU.Eventing = Eventing = (function() {
    Eventing.prototype._hub = null;
    Eventing.prototype._listeners = null;
    function Eventing(hubu) {
      var myExtension;
      this._hub = hubu;
      this._listeners = [];
      myExtension = this;
      /*
          # Gets the registered event listeners.
          # *Do not modified the result !*
          # @return the list of registered listeners.
          */
      this._hub.getListeners = function() {
        return myExtension._listeners;
      };
      /*
          # Registers an event listener.
          # This method can take either 2 or 3 arguments. The first one is *always* the component, so two signatures are possible:
          #
          # * `registerListener(component, match, callback)` where `match` is the matching function and `callback` is the
          # reception callback.
          # * `registerListener(component, conf)` where `conf` is an object containing `match` and `callback` specifying
          # respectively the event matching method and the reception callback.
          #
          # @param {HUBU.AbstractComponent} component : the component registering the listener
          # @param {Function} match : the method called to check if the event matches. This method must returns true or false.
          # @param {Function} callback : the callback method to invoke when a matching event is sent
          # @return the hub
          */
      this._hub.registerListener = function() {
        var component, conf;
        component = arguments[0], conf = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
        if (conf.length >= 2) {
          myExtension.registerListener(component, conf[0], conf[1]);
          return this;
        } else {
          myExtension.registerListener(component, conf[1]);
          return this;
        }
      };
      /*
          # *Deprecated method*, use `registerListener` instead.
          */
      this._hub.registerConfigurableListener = function(component, conf) {
        HUBU.logger.warn("registerConfigurableListener is a deprecated method and may disappear at any time, use registerListener instead");
        myExtension.registerListener(component, conf);
        return this;
      };
      /*
          # Unregisters listeners for the given component. According to the arguments, several cases occur:
          # `component` can be either a String of a Component. In case of the string, we look up for the component using
          # `getComponentName`.
          # If `callback` is defined, only the listener matching component and callback will be unregistered. Otherwise all
          # listeners of the component will be unregistered.
          # If `component` is `null`, this methods does nothing.
          # @param {HUBU.AbstractComponent} component the component
          # @param {Function} callback the callback function (optional)
          # @return the current hub
          */
      this._hub.unregisterListener = function(component, callback) {
        myExtension.unregisterListener(component, callback);
        return this;
      };
      /*
          # Sends an event inside the hub. If component or event is null, the method does nothing. If not, the event processed
          # and sent to all matching listeners.
          # @param {HUBU.AbstractComponent} component the component sending the event
          # @param {Object} event the event
          # @return true if the event was delivered to at least one component, false otherwise
          # @methodOf HUBU.hubu
          */
      this._hub.sendEvent = function(component, event) {
        return myExtension.sendEvent(component, event);
      };
      /*
          # Subscribes to a specific topic.
          # @param {HUBU.AbstractComponent} component : the component registering the listener
          # @param {String} topic : the topic (Regexp)
          # @param {Function} callback : the callback method to invoke when a matching event is sent
          # @param {Function} filter : optional method to filter received events.
          # @return the current hub
          # @methodOf HUBU.hubu
          */
      this._hub.subscribe = function(component, topic, callback, filter) {
        myExtension.subscribe(component, topic, callback, filter);
        return this;
      };
      /*
          # Unsubscribes the subscriber.
          # @param {Object} component the component
          # @param {Function} callback the registered callback
          # @methodOf HUBU.hubu
          # @return the current hub
          */
      this._hub.unsubscribe = function(component, callback) {
        myExtension.unsubscribe(component, callback);
        return this;
      };
      /*
          # Publishes an event to a specific topic. If component, topic or event is null, the method does nothing. If not,
          # the event is processed and sent to all matching listeners.
          # @param {HUBU.AbstractComponent} component the component sending the event
          # @param {String} topic the topic
          # @param {Object} event the event
          # @return true if the event was delivered to at least one component, false otherwise
          # @methodOf HUBU.hubu
          */
      this._hub.publish = function(component, callback, event) {
        myExtension.publish(component, callback, event);
        return this;
      };
    }
    /* End of constructor  */
    /*
      # Processes the given event sent by the given component. This methods checks who is interested by the event by
      # calling the match method, then the callback method is called.
      # The event is extended with the 'source' property indicating the component sending the event.
      # @param {Object} event
      # @param {AbstractComponent} component
      # @return true if the event was consumed by at least one component, false otherwise.
      */
    Eventing.prototype._processEvent = function(component, event) {
      var ev, listener, sent, _i, _len, _ref;
      if (!(event != null) || !(component != null)) {
        HUBU.logger.warn("Can't process event - component or event not defined");
        return false;
      }
      sent = false;
      _ref = this._listeners;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        listener = _ref[_i];
        if (listener.component !== component) {
          ev = HUBU.UTILS.clone(event);
          ev.source = component;
          if (listener.match.apply(listener.component, [ev])) {
            listener.callback.apply(listener.component, [ev]);
            sent = true;
          }
        }
      }
      return sent;
    };
    Eventing.prototype.registerListener = function() {
      var callback, component, listener, match, others;
      component = arguments[0], others = 2 <= arguments.length ? __slice.call(arguments, 1) : [];
      match = null;
      callback = null;
      switch (others.length) {
        case 2:
          match = others[0];
          callback = others[1];
          break;
        case 1:
          match = others[0].match;
          callback = others[0].callback;
      }
      if (!(component != null) || !(match != null) || !(callback != null)) {
        throw new Exception("Cannot register event listener, component or match or callback is/are not defined").add("component", component).add("match", match).add("callback", callback);
      }
      if (!HUBU.UTILS.isComponentPlugged(component, this._hub)) {
        throw new Exception("Cannot register event listener, the component is not plugged on the hub");
      }
      listener = {
        "component": component,
        "callback": callback,
        "match": match
      };
      return this._listeners.push(listener);
    };
    Eventing.prototype.unregisterListener = function(component, callback) {
      var cmp, listener, toRemove, _i, _j, _k, _len, _len2, _len3, _ref, _ref2, _results;
      if (!(component != null)) {
        HUBU.logger.warn("Cannot unregister listener - component not defined");
        return false;
      }
      cmp = this.getComponent(component);
      if (!(cmp != null)) {
        HUBU.logger.warn("Cannot unregister listener - component not plugged on the hub");
        return false;
      }
      toRemove = [];
      if ((callback != null)) {
        _ref = this._listeners;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          listener = _ref[_i];
          if (listener.component === cmp && listener.callback === callback) {
            toRemove.push(listener);
          }
        }
      } else {
        _ref2 = this._listeners;
        for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
          listener = _ref2[_j];
          if (listener.component === cmp) {
            toRemove.push(listener);
          }
        }
      }
      _results = [];
      for (_k = 0, _len3 = toRemove.length; _k < _len3; _k++) {
        listener = toRemove[_k];
        _results.push(this._listeners = HUBU.UTILS.removeElementFromArray(this._listeners, listener));
      }
      return _results;
    };
    /*
      # Helper method retriving a component object from the given argument.
      # If the argument is a String, it performs a lookup by name
      # If the argument is a component object, it just checks the conformity
      */
    Eventing.prototype.getComponent = function(obj) {
      if (HUBU.UTILS.typeOf(obj) === "string") {
        return this._hub.getComponent(obj);
      }
      if (HUBU.UTILS.isComponent(obj)) {
        return obj;
      }
      return null;
    };
    Eventing.prototype.sendEvent = function(component, event) {
      if (!(component != null) || !(event != null)) {
        HUBU.logger.warn("Cannot send event, component or/and event are undefined");
        return;
      }
      return this._processEvent(component, event);
    };
    Eventing.prototype.subscribe = function(component, topic, callback, filter) {
      var match, regex;
      if (!(component != null) || !(topic != null) || !(callback != null)) {
        HUBU.logger.warn("Cannot subscribe to topic, component or/and topic and/or callback are undefined");
        return;
      }
      regex = new RegExp(topic);
      match = null;
      if (!(filter != null) || !HUBU.UTILS.isFunction(filter)) {
        match = function(event) {
          return regex.test(event.topic);
        };
      } else {
        match = function(event) {
          return regex.test(event.topic) && filter(event);
        };
      }
      return this.registerListener(component, match, callback);
    };
    Eventing.prototype.unsubscribe = function(component, callback) {
      return this.unregisterListener(component, callback);
    };
    Eventing.prototype.publish = function(component, topic, event) {
      if (!(component != null) || !(topic != null) || !(event != null)) {
        HUBU.logger.info("Cannot publish event - component and/or topic and/or event are missing");
        return false;
      }
      event.topic = topic;
      return this.sendEvent(component, event);
    };
    Eventing.prototype.reset = function() {
      return this._listeners = [];
    };
    Eventing.prototype.unregisterComponent = function(cmp) {
      return this.unregisterListener(cmp);
    };
    return Eventing;
  })();
  /* End of the Eventing class  */
  getHubuExtensions().eventing = Eventing;
}).call(this);

(function() {
  /*
  # Hubu Binding Extension
  # This extension allows to bind components together using direct binding declaration
  */
  var Binding;
  HUBU.Binding = Binding = (function() {
    Binding.prototype._hub = null;
    function Binding(hubu) {
      var myExtension;
      this._hub = hubu;
      /* Injection  of the bind method */
      myExtension = this;
      this._hub.bind = function(binding) {
        myExtension.bind(binding);
        return this;
      };
    }
    /*
      # Helper method retriving a component object from the given argument.
      # If the argument is a String, it performs a lookup by name
      # If the argument is a component object, it just checks the conformity
      */
    Binding.prototype.getComponent = function(obj) {
      var component;
      component = null;
      if (HUBU.UTILS.typeOf(obj) === "string") {
        return this._hub.getComponent(obj);
      }
      if (HUBU.UTILS.isComponent(obj)) {
        return obj;
      }
      return null;
    };
    Binding.prototype.getInjectedObject = function(binding, component) {
      if (binding.contract != null) {
        if (!HUBU.UTILS.isObjectConformToContract(component, binding.contract)) {
          throw new Exception("Cannot bind components, the component is not conform to contract").add("component", component.getComponentName()).add("contract", binding.contract);
        } else {
          if (!(binding.proxy != null) || binding.proxy) {
            return HUBU.UTILS.createProxyForContract(binding.contract, component);
          }
        }
      }
      return component;
    };
    Binding.prototype.bind = function(binding) {
      var component, to;
      if (!(binding != null) || !(binding != null ? binding.to : void 0) || !(binding != null ? binding.component : void 0) || !(binding != null ? binding.into : void 0)) {
        throw new Exception("Cannot bind components - component, to and into must be defined");
      }
      component = this.getComponent(binding.component);
      if (!(component != null)) {
        throw new Exception("Cannot bind components - 'component' is invalid").add("component", binding.component);
      }
      to = this.getComponent(binding.to);
      if (!(to != null)) {
        throw new Exception("Cannot bind components - 'to' is invalid").add("component", binding.to);
      }
      component = this.getInjectedObject(binding, component);
      switch (HUBU.UTILS.typeOf(binding.into)) {
        case "function":
          return binding.into.apply(to, [component]);
        case "string":
          if (!(to[binding.into] != null)) {
            return to[binding.into] = component;
          } else if (HUBU.UTILS.isFunction(to[binding.into])) {
            return to[binding.into].apply(to, [component]);
          } else {
            return to[binding.into] = component;
          }
          break;
        default:
          throw new Exception("Cannot bind components = 'into' must be either a function or a string").add("into", binding.into);
      }
    };
    return Binding;
  })();
  getHubuExtensions().binding = Binding;
}).call(this);

(function() {
  /*
  # Define the building block of the Service-Orientation of H-UBU
  */
  /*
  TODO Used by -> the usage graph
  TODO Several contract within a registration
  TODO Service Ranking
  TODO Factories / Object creation strategy ?
  */
  var SOC, ServiceEvent, ServiceReference, ServiceRegistration, ServiceRegistry, _ref;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  getGlobal().SOC = (_ref = getGlobal().SOC) != null ? _ref : {};
  SOC = getGlobal().SOC;
  /*
  # Service Registrations represents a published service from the publisher point of view.
  */
  SOC.ServiceRegistration = ServiceRegistration = (function() {
    ServiceRegistration._nextId = 1;
    ServiceRegistration.prototype._id = -1;
    ServiceRegistration.prototype._component = null;
    ServiceRegistration.prototype._contract = null;
    ServiceRegistration.prototype._hub = null;
    ServiceRegistration.prototype._registered = false;
    ServiceRegistration.prototype._properties = {};
    ServiceRegistration.prototype._reference = null;
    ServiceRegistration.prototype._registry = null;
    ServiceRegistration.prototype._svcObject = null;
    ServiceRegistration.getAndIncId = function() {
      var id;
      id = SOC.ServiceRegistration._nextId;
      SOC.ServiceRegistration._nextId = SOC.ServiceRegistration._nextId + 1;
      return id;
    };
    function ServiceRegistration(contract, component, svcObject, properties, hub, registry) {
      this._id = -1;
      if (!(component != null)) {
        throw new Exception("Cannot create a service registration without a valid component");
      }
      if (!(svcObject != null)) {
        throw new Exception("Cannot create a service registration without a valid service object");
      }
      if (!(contract != null)) {
        throw new Exception("Cannot create a service registration without a contract");
      }
      if (!(hub != null)) {
        throw new Exception("Cannot create a service registration without the hub");
      }
      if (!(registry != null)) {
        throw new Exception("Cannot create a service registration without the registry");
      }
      this._component = component;
      this._hub = hub;
      this._contract = contract;
      this._properties = properties != null ? properties : {};
      this._registry = registry;
      this._svcObject = svcObject;
      this._properties["service.contract"] = this._contract;
      this._properties["service.publisher"] = this._component;
    }
    ServiceRegistration.prototype.register = function() {
      if (!HUBU.UTILS.isComponentPlugged(this._component, this._hub)) {
        throw new Exception("Invalid registration, the     component is not plugged on the hub");
      }
      this._id = SOC.ServiceRegistration.getAndIncId();
      this._reference = new SOC.ServiceReference(this);
      this._properties["service.id"] = this._id;
      this._registered = this._id !== -1;
      return this._id;
    };
    ServiceRegistration.prototype.unregister = function() {
      if (!HUBU.UTILS.isComponentPlugged(this._component, this._hub)) {
        throw new Exception("Invalid registration, the         component is not plugged on the hub");
      }
      return this._registered = false;
    };
    ServiceRegistration.prototype.isRegistered = function() {
      return this._registered;
    };
    ServiceRegistration.prototype.getReference = function() {
      if (!HUBU.UTILS.isComponentPlugged(this._component, this._hub)) {
        throw new Exception("Invalid registration, the         component is not plugged on the hub");
      }
      return this._reference;
    };
    ServiceRegistration.prototype.getProperties = function() {
      return this._properties;
    };
    ServiceRegistration.prototype.getService = function(component) {
      if (!HUBU.UTILS.isFunction(this._svcObject)) {
        return this._svcObject;
      }
      return this._svcObject.apply(this._component, [component]);
    };
    ServiceRegistration.prototype.setProperties = function(properties) {
      var event, old, props;
      old = null;
      if (this.isRegistered()) {
        props = HUBU.UTILS.clone(this._properties, ["service.contract", "service.publisher"]);
        old = new SOC.ServiceRegistration(this._contract, this._component, this._svcObject, props, this._hub, this._registry);
        old._id = this._id;
        old._reference = new SOC.ServiceReference(old);
      }
      this._properties = properties != null ? properties : {};
      this._properties["service.contract"] = this._contract;
      this._properties["service.publisher"] = this._component;
      this._properties["service.id"] = this._id;
      if (this.isRegistered() && (old != null)) {
        event = new SOC.ServiceEvent(SOC.ServiceEvent.MODIFIED, this.getReference());
        return this._registry.fireServiceEvent(event, old.getReference());
      }
    };
    return ServiceRegistration;
  })();
  /*
  #  Service Reference represents a published service from the consumer point of view.
  */
  SOC.ServiceReference = ServiceReference = (function() {
    ServiceReference.prototype._registration = null;
    function ServiceReference(registration) {
      this._registration = registration;
    }
    ServiceReference.prototype.getContract = function() {
      return this._registration.getProperties()["service.contract"];
    };
    ServiceReference.prototype.getProperties = function() {
      return this._registration.getProperties();
    };
    ServiceReference.prototype.getProperty = function(key) {
      return this._registration.getProperties()[key];
    };
    ServiceReference.prototype.getId = function() {
      return this._registration.getProperties()["service.id"];
    };
    ServiceReference.prototype.isValid = function() {
      return this._registration.isRegistered;
    };
    return ServiceReference;
  })();
  SOC.ServiceEvent = ServiceEvent = (function() {
    ServiceEvent.REGISTERED = 1;
    ServiceEvent.MODIFIED = 2;
    ServiceEvent.UNREGISTERING = 4;
    ServiceEvent.MODIFIED_ENDMATCH = 8;
    ServiceEvent.prototype._type = 0;
    ServiceEvent.prototype._reference = null;
    function ServiceEvent(type, ref) {
      this._type = type;
      this._reference = ref;
    }
    ServiceEvent.prototype.getReference = function() {
      return this._reference;
    };
    ServiceEvent.prototype.getType = function() {
      return this._type;
    };
    return ServiceEvent;
  })();
  /*
  # The Service Registry class
  */
  SOC.ServiceRegistry = ServiceRegistry = (function() {
    ServiceRegistry.prototype._registrations = null;
    ServiceRegistry.prototype._hub = null;
    ServiceRegistry.prototype._listeners = null;
    function ServiceRegistry(hub) {
      this._registrations = [];
      this._listeners = [];
      if (!(hub != null)) {
        throw new Exception("Cannot initialize the service registry without a hub");
      }
      this._hub = hub;
    }
    /*
      # Gets all registered services.
      # @return the list of service references, empty if no services are registered
      */
    ServiceRegistry.prototype.getRegisteredServices = function() {
      var entry, reg, result, _i, _j, _len, _len2, _ref2, _ref3;
      result = [];
      _ref2 = this._registrations;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        entry = _ref2[_i];
        _ref3 = entry.registrations;
        for (_j = 0, _len2 = _ref3.length; _j < _len2; _j++) {
          reg = _ref3[_j];
          result.push(reg.getReference());
        }
      }
      return result;
    };
    /*
      # Adds a service registration
      */
    ServiceRegistry.prototype._addRegistration = function(component, reg) {
      var cmpEntry, entry, _i, _len, _ref2;
      _ref2 = this._registrations;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        entry = _ref2[_i];
        if (entry.component === component) {
          cmpEntry = entry;
        }
      }
      if (!(cmpEntry != null)) {
        cmpEntry = {
          'component': component,
          'registrations': []
        };
        this._registrations.push(cmpEntry);
      }
      return cmpEntry.registrations.push(reg);
    };
    ServiceRegistry.prototype._removeRegistration = function(reg) {
      var cmpEntry, entry, _i, _len, _ref2;
      _ref2 = this._registrations;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        entry = _ref2[_i];
        if (HUBU.UTILS.indexOf(entry.registrations, reg) !== -1) {
          cmpEntry = entry;
        }
      }
      if (!(cmpEntry != null)) {
        return null;
      }
      HUBU.UTILS.removeElementFromArray(cmpEntry.registrations, reg);
      if (cmpEntry.registrations.length === 0) {
        HUBU.UTILS.removeElementFromArray(this._registrations, cmpEntry);
      }
      return cmpEntry.component;
    };
    /*
      # Registers a service
      # @return the service registration
      */
    ServiceRegistry.prototype.registerService = function(component, contract, properties, svcObject) {
      var reg;
      if (!(contract != null)) {
        throw new Exception("Cannot register a service without a proper contract");
      }
      if (!(component != null)) {
        throw new Exception("Cannot register a service without a valid component");
      }
      svcObject = svcObject != null ? svcObject : component;
      if (!HUBU.UTILS.isFunction(svcObject) && !HUBU.UTILS.isObjectConformToContract(svcObject, contract)) {
        throw new Exception("Cannot register service - the service object does not implement the contract").add("contract", contract).add("component", component);
      }
      svcObject = svcObject != null ? svcObject : component;
      reg = new ServiceRegistration(contract, component, svcObject, properties, this._hub, this);
      this._addRegistration(component, reg);
      reg.register();
      this.fireServiceEvent(new SOC.ServiceEvent(SOC.ServiceEvent.REGISTERED, reg.getReference()));
      return reg;
    };
    /*
      # Unregisters a service
      */
    ServiceRegistry.prototype.unregisterService = function(registration) {
      var component, ref;
      if (!(registration != null)) {
        throw new Exception("Cannot unregister the service - invalid registration");
      }
      component = this._removeRegistration(registration);
      if ((component != null)) {
        ref = registration.getReference();
        registration.unregister();
        this.fireServiceEvent(new SOC.ServiceEvent(SOC.ServiceEvent.UNREGISTERING, ref));
        return true;
      }
      throw new Exception("Cannot unregister service - registration not found");
    };
    ServiceRegistry.prototype.unregisterServices = function(component) {
      var cmpEntry, entry, reg, regs, _i, _j, _len, _len2, _ref2;
      if (!(component != null)) {
        throw new Exception("Cannot unregister the services - invalid component");
      }
      _ref2 = this._registrations;
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        entry = _ref2[_i];
        if (entry.component === component) {
          cmpEntry = entry;
        }
      }
      if (cmpEntry != null) {
        regs = cmpEntry.registrations;
        if (regs != null) {
          for (_j = 0, _len2 = regs.length; _j < _len2; _j++) {
            reg = regs[_j];
            this.unregisterService(reg);
          }
        }
        return HUBU.UTILS.removeElementFromArray(this._registrations, cmpEntry);
      }
    };
    ServiceRegistry.prototype.getServiceReferences = function(contract, filter) {
      return this._match(this._buildFilter(contract, filter));
    };
    /*
      # Traverses the registered services to select the ones matching with the given filter (method)
      # It returns an empty array if ne matching service can be found
      */
    ServiceRegistry.prototype._match = function(filter) {
      var matching, ref, refs;
      refs = this.getRegisteredServices();
      matching = (function() {
        var _i, _len, _results;
        _results = [];
        for (_i = 0, _len = refs.length; _i < _len; _i++) {
          ref = refs[_i];
          if (filter.match(ref)) {
            _results.push(ref);
          }
        }
        return _results;
      })();
      return matching;
    };
    /*
      # Build an object with a `match` function built from the contract and the filter.
      */
    ServiceRegistry.prototype._buildFilter = function(contract, filter) {
      var container;
      if (!(contract != null) && !(filter != null)) {
        return {
          match: function(ref) {
            return true;
          }
        };
      } else if ((contract != null) && !(filter != null)) {
        container = {};
        container.contract = contract;
        container.match = __bind(function(ref) {
          return ref.getProperty("service.contract") === container.contract;
        }, this);
        return container;
      } else if ((contract != null) && (filter != null)) {
        container = {};
        container.contract = contract;
        container.filter = filter;
        container.match = __bind(function(ref) {
          return (ref.getProperty("service.contract") === container.contract) && container.filter(ref);
        }, this);
        return container;
      } else {
        return {
          filter: filter,
          match: function(ref) {
            return this.filter(ref);
          }
        };
      }
    };
    ServiceRegistry.prototype.getService = function(component, ref) {
      if (!(ref != null)) {
        throw new Exception("Cannot get service - the reference is null");
      }
      if (!ref.isValid()) {
        HUBU.logger.warn("Cannot retrieve service for " + ref + " - the reference is invalid");
        return null;
      }
      return ref._registration.getService(component);
    };
    ServiceRegistry.prototype.ungetService = function(component, ref) {};
    ServiceRegistry.prototype.registerServiceListener = function(listenerConfig) {
      var contract, filter, listener, newFilter, svcListener;
      contract = listenerConfig.contract, filter = listenerConfig.filter, listener = listenerConfig.listener;
      if (!(listener != null)) {
        throw new Exception("Can't register the service listener, the listener is not set").add("listenerConfig", listenerConfig);
      }
      newFilter = this._buildFilter(contract, filter);
      svcListener = {
        listener: listener,
        filter: newFilter,
        contract: contract
      };
      if (HUBU.UTILS.isObject(listener)) {
        if (!HUBU.UTILS.isObjectConformToContract(listener, SOC.ServiceListener)) {
          throw new Exception("Can't register the service listener, the listener is not conform to the Service Listener contract");
        }
      }
      return this._listeners.push(svcListener);
    };
    ServiceRegistry.prototype.unregisterServiceListener = function(listenerConfig) {
      var contract, filter, list, listener, _i, _len, _ref2, _results;
      contract = listenerConfig.contract, filter = listenerConfig.filter, listener = listenerConfig.listener;
      if (!(listener != null)) {
        throw new Exception("Can't unregister the service listener, the listener is not set").add("listenerConfig", listenerConfig);
      }
      _ref2 = this._listeners;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        list = _ref2[_i];
        _results.push(list.contract === contract && list.listener === listener ? HUBU.UTILS.removeElementFromArray(this._listeners, list) : void 0);
      }
      return _results;
    };
    /*
      # This method should be used by the extension only.
      */
    ServiceRegistry.prototype.fireServiceEvent = function(event, oldRef) {
      var listener, matched, newEvent, _i, _len, _ref2, _results;
      _ref2 = this._listeners;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        listener = _ref2[_i];
        matched = !(listener.filter != null) || this._testAgainstFilter(listener, event.getReference());
        _results.push(matched ? this._invokeServiceListener(listener, event) : event.getType() === SOC.ServiceEvent.MODIFIED && (oldRef != null) ? this._testAgainstFilter(listener, oldRef) ? (newEvent = new SOC.ServiceEvent(SOC.ServiceEvent.MODIFIED_ENDMATCH, event.getReference()), this._invokeServiceListener(listener, newEvent)) : void 0 : void 0);
      }
      return _results;
    };
    ServiceRegistry.prototype._testAgainstFilter = function(listener, ref) {
      return listener.filter.match(ref);
    };
    ServiceRegistry.prototype._invokeServiceListener = function(listener, event) {
      if (HUBU.UTILS.isFunction(listener.listener)) {
        return listener.listener(event);
      } else if (HUBU.UTILS.isObject(listener.listener)) {
        return listener.serviceChanged(event);
      }
    };
    return ServiceRegistry;
  })();
}).call(this);

(function() {
  /*
  # Hubu Service-Orientation Extension
  */
  var ProvidedService, ServiceComponent, ServiceDependency, ServiceOrientation;
  HUBU.ServiceComponent = ServiceComponent = (function() {
    ServiceComponent.STOPPED = 0;
    ServiceComponent.INVALID = 1;
    ServiceComponent.VALID = 2;
    ServiceComponent.prototype._component = null;
    ServiceComponent.prototype._providedServices = null;
    ServiceComponent.prototype._requiredServices = null;
    ServiceComponent.prototype._state = 0;
    function ServiceComponent(component) {
      this._component = component;
      this._providedServices = [];
      this._requiredServices = [];
      this._state = ServiceComponent.STOPPED;
    }
    ServiceComponent.prototype.getComponent = function() {
      return this._component;
    };
    ServiceComponent.prototype.getState = function() {
      return this._state;
    };
    ServiceComponent.prototype.addProvidedService = function(ps) {
      if (HUBU.UTILS.indexOf(this._providedServices, ps) === -1) {
        this._providedServices.push(ps);
        ps.setServiceComponent(this);
        if (this._state > ServiceComponent.STOPPED) {
          ps.onStart();
        }
        if (this._state === ServiceComponent.VALID) {
          ps.onValidation();
        }
        if (this._state === ServiceComponent.INVALID) {
          return ps.onInvalidation();
        }
      }
    };
    ServiceComponent.prototype.removeProvidedService = function(ps) {
      if (HUBU.UTILS.indexOf(this._providedServices, ps) !== -1) {
        HUBU.UTILS.removeElementFromArray(this._providedServices, ps);
        return ps.onStop();
      }
    };
    ServiceComponent.prototype.addRequiredService = function(req) {
      if (HUBU.UTILS.indexOf(this._requiredServices, req) === -1) {
        this._requiredServices.push(req);
        req.setServiceComponent(this);
        if (this._state > ServiceComponent.STOPPED) {
          req.onStart();
          return this.computeState();
        }
      }
    };
    ServiceComponent.prototype.removeRequireService = function(req) {
      if (HUBU.UTILS.indexOf(this._requiredServices, req) > -1) {
        HUBU.UTILS.removeElementFromArray(this._requiredServices, req);
        req.onStop();
        if (this._state > ServiceComponent.STOPPED) {
          return this.computeState();
        }
      }
    };
    ServiceComponent.prototype.computeState = function() {
      var isValid, oldState, req, _i, _len, _ref;
      isValid = true;
      _ref = this._requiredServices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        req = _ref[_i];
        isValid = isValid && req.isValid();
      }
      oldState = this._state;
      this._state = isValid ? ServiceComponent.VALID : ServiceComponent.INVALID;
      if (this._state > oldState && this._state === ServiceComponent.VALID) {
        this._validate();
      } else if (this._state < oldState && this._state === ServiceComponent.INVALID) {
        this._invalidate();
      }
      return this._state;
    };
    ServiceComponent.prototype._validate = function() {
      var prov, _i, _len, _ref, _ref2, _results;
      HUBU.logger.debug("Validate instance " + ((_ref = this._component) != null ? _ref.getComponentName() : void 0));
      _ref2 = this._providedServices;
      _results = [];
      for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
        prov = _ref2[_i];
        _results.push(prov.onValidation());
      }
      return _results;
    };
    ServiceComponent.prototype._invalidate = function() {
      var prov, _i, _len, _ref, _results;
      HUBU.logger.debug("Invalidate instance");
      _ref = this._providedServices;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prov = _ref[_i];
        _results.push(prov.onInvalidation());
      }
      return _results;
    };
    ServiceComponent.prototype.onStart = function() {
      var prov, req, _i, _j, _len, _len2, _ref, _ref2;
      _ref = this._requiredServices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        req = _ref[_i];
        req.onStart();
      }
      _ref2 = this._providedServices;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        prov = _ref2[_j];
        prov.onStart();
      }
      return this.computeState();
    };
    ServiceComponent.prototype.onStop = function() {
      var prov, req, _i, _j, _len, _len2, _ref, _ref2;
      _ref = this._providedServices;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        prov = _ref[_i];
        prov.onStop();
      }
      _ref2 = this._requiredServices;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        req = _ref2[_j];
        req.onStop();
      }
      return this._state = ServiceComponent.STOPPED;
    };
    return ServiceComponent;
  })();
  HUBU.ServiceDependency = ServiceDependency = (function() {
    var _listener, _refs, _serviceComponent, _state;
    ServiceDependency.UNRESOLVED = 0;
    ServiceDependency.RESOLVED = 1;
    ServiceDependency.prototype._component = null;
    ServiceDependency.prototype._contract = null;
    ServiceDependency.prototype._filter = null;
    ServiceDependency.prototype._aggregate = false;
    ServiceDependency.prototype._optional = false;
    ServiceDependency.prototype._field = null;
    ServiceDependency.prototype._bind = null;
    ServiceDependency.prototype._unbind = null;
    ServiceDependency.prototype._hub = null;
    _listener = null;
    _state = null;
    _refs = [];
    _serviceComponent = null;
    function ServiceDependency(component, contract, filter, aggregate, optional, field, bind, unbind, hub) {
      var self;
      this._component = component;
      this._contract = contract;
      this._filter = filter;
      this._aggregate = aggregate;
      this._optional = optional;
      this._field = field;
      if (bind != null) {
        this._bind = HUBU.UTILS.isFunction(bind) ? bind : this._component[bind];
        if (!(this._bind != null)) {
          throw new Exception("Bind method " + bind + " not found on component");
        }
      }
      if (unbind != null) {
        this._unbind = HUBU.UTILS.isFunction(unbind) ? unbind : this._component[unbind];
        if (!(this._unbind != null)) {
          throw new Exception("Unbind method " + unbind + " not found on component");
        }
      }
      this._hub = hub;
      this._state = HUBU.ServiceDependency.UNRESOLVED;
      this._refs = [];
      self = this;
      this._listener = {
        contract: this._contract,
        filter: this._filter,
        listener: function(event) {
          switch (event.getType()) {
            case SOC.ServiceEvent.REGISTERED:
              return self._onServiceArrival(event.getReference());
            case SOC.ServiceEvent.MODIFIED:
              return self._onServiceModified(event.getReference());
            case SOC.ServiceEvent.UNREGISTERING:
              return self._onServiceDeparture(event.getReference());
            case SOC.ServiceEvent.MODIFIED_ENDMATCH:
              return self._onServiceDeparture(event.getReference());
          }
        }
      };
    }
    /* End Constructor */
    ServiceDependency.prototype.setServiceComponent = function(sc) {
      return this._serviceComponent = sc;
    };
    ServiceDependency.prototype.onStart = function() {
      this._state = HUBU.ServiceDependency.UNRESOLVED;
      this._startTracking();
      return this._computeDependencyState();
    };
    ServiceDependency.prototype.onStop = function() {
      this._stopTracking();
      this._ungetAllServices();
      this._refs = [];
      return this._state = HUBU.ServiceDependency.UNRESOLVED;
    };
    ServiceDependency.prototype._ungetAllServices = function() {
      var entry, _i, _len, _ref, _results;
      _ref = this._refs;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (entry.service != null) {
          entry.service = null;
          _results.push(this._hub.ungetService(this._component, entry.reference));
        }
      }
      return _results;
    };
    ServiceDependency.prototype._startTracking = function() {
      var ref, refs, _i, _len, _results;
      this._hub.registerServiceListener(this._listener);
      refs = this._hub.getServiceReferences(this._contract, this._filter);
      _results = [];
      for (_i = 0, _len = refs.length; _i < _len; _i++) {
        ref = refs[_i];
        _results.push(this._onServiceArrival(ref));
      }
      return _results;
    };
    ServiceDependency.prototype._stopTracking = function() {
      return this._hub.unregisterServiceListener(this._listener);
    };
    ServiceDependency.prototype.isValid = function() {
      return this._state === HUBU.ServiceDependency.RESOLVED;
    };
    ServiceDependency.prototype._computeDependencyState = function() {
      var oldState;
      oldState = this._state;
      if (this._optional || this._refs.length > 0) {
        this._state = HUBU.ServiceDependency.RESOLVED;
      } else {
        this._state = HUBU.ServiceDependency.UNRESOLVED;
      }
      if (oldState !== this._state) {
        return this._serviceComponent.computeState();
      }
    };
    ServiceDependency.prototype._onServiceArrival = function(ref) {
      var entry, refEntry, _i, _len, _ref;
      HUBU.logger.debug("Service arrival detected for " + this._component.getComponentName());
      _ref = this._refs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (entry.reference === ref) {
          refEntry = entry;
        }
      }
      if (!(refEntry != null)) {
        refEntry = {
          reference: ref,
          service: null
        };
        this._refs.push(refEntry);
        this._computeDependencyState();
        if (this._aggregate) {
          return this._inject(refEntry);
        } else {
          if (this._refs.length === 1) {
            return this._inject(refEntry);
          }
        }
      }
    };
    ServiceDependency.prototype._onServiceDeparture = function(ref) {
      var entry, newRef, refEntry, _i, _len, _ref;
      HUBU.logger.debug("Service departure detected for " + this._component.getComponentName());
      _ref = this._refs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (entry.reference === ref) {
          refEntry = entry;
        }
      }
      if (refEntry != null) {
        HUBU.UTILS.removeElementFromArray(this._refs, refEntry);
        if (refEntry.service != null) {
          this._deinject(refEntry);
          this._hub.ungetService(this._component, ref);
          refEntry.service = null;
        }
        if (this._refs.length > 0) {
          newRef = this._refs[0];
          if (!this._aggregate) {
            return this._inject(newRef);
          }
        } else {
          return this._computeDependencyState();
        }
      }
    };
    ServiceDependency.prototype._onServiceModified = function(ref) {
      var entry, refEntry, _i, _len, _ref;
      _ref = this._refs;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (entry.reference === ref) {
          refEntry = entry;
        }
      }
      if (!(refEntry != null)) {
        return this._onServiceArrival(ref);
      }
    };
    ServiceDependency.prototype._inject = function(entry) {
      var svc;
      svc = this._hub.getService(this._serviceComponent, entry.reference);
      entry.service = svc;
      if ((this._field != null) && this._aggregate) {
        if (!(this._component[this._field] != null)) {
          this._component[this._field] = [svc];
        } else {
          this._component[this._field].push(svc);
        }
      }
      if ((this._field != null) && !this._aggregate) {
        this._component[this._field] = svc;
      }
      if (this._bind != null) {
        return this._bind.apply(this._component, [svc, entry.reference]);
      }
    };
    ServiceDependency.prototype._deinject = function(entry) {
      if ((this._field != null) && this._aggregate) {
        HUBU.UTILS.removeElementFromArray(this._component[this._field], entry.service);
      }
      if ((this._field != null) && !this._aggregate) {
        this._component[this._field] = null;
      }
      if (this._unbind != null) {
        return this._unbind.apply(this._component, [entry.service, entry.reference]);
      }
    };
    return ServiceDependency;
  })();
  HUBU.ProvidedService = ProvidedService = (function() {
    ProvidedService.UNREGISTERED = 0;
    ProvidedService.REGISTERED = 1;
    ProvidedService.prototype._hub = null;
    ProvidedService.prototype._contract = null;
    ProvidedService.prototype._properties = null;
    ProvidedService.prototype._registration = null;
    ProvidedService.prototype._serviceComponent = null;
    ProvidedService.prototype._component = null;
    ProvidedService.prototype._preRegistration = null;
    ProvidedService.prototype._postRegistration = null;
    ProvidedService.prototype._preUnregistration = null;
    ProvidedService.prototype._postUnRegistration = null;
    function ProvidedService(component, contract, properties, preRegistration, postRegistration, preUnregistration, postUnregistration, hub) {
      this._component = component;
      this._contract = contract;
      this._hub = hub;
      this._properties = properties;
      if (preRegistration != null) {
        this._preRegistration = HUBU.UTILS.isFunction(preRegistration) ? preRegistration : this._component[preRegistration];
        if (!(this._preRegistration != null)) {
          throw new Exception("preRegistration method " + preRegistration + " not found on component");
        }
      }
      if (postRegistration != null) {
        this._postRegistration = HUBU.UTILS.isFunction(postRegistration) ? postRegistration : this._component[postRegistration];
        if (!(this._postRegistration != null)) {
          throw new Exception("postRegistration method " + postRegistration + " not found on component");
        }
      }
      if (preUnregistration != null) {
        this._preUnregistration = HUBU.UTILS.isFunction(preUnregistration) ? preUnregistration : this._component[preUnregistration];
        if (!(this._preUnregistration != null)) {
          throw new Exception("preUnregistration method " + preUnregistration + " not found on component");
        }
      }
      if (postUnregistration != null) {
        this._postUnRegistration = HUBU.UTILS.isFunction(postUnregistration) ? postUnregistration : this._component[postUnregistration];
        if (!(this._postUnRegistration != null)) {
          throw new Exception("postUnregistration method " + postUnregistration + " not found on component");
        }
      }
    }
    ProvidedService.prototype.setServiceComponent = function(sc) {
      return this._serviceComponent = sc;
    };
    ProvidedService.prototype._register = function() {
      var proxy;
      if (this._registration != null) {
        return false;
      }
      if ((this._preRegistration != null)) {
        this._preRegistration.apply(this._component, []);
      }
      proxy = HUBU.UTILS.createProxyForContract(this._contract, this._component);
      this._registration = this._hub.registerService(this._component, this._contract, this._properties, proxy);
      HUBU.logger.debug("Service from " + this._component.getComponentName() + " registered");
      if ((this._postRegistration != null)) {
        this._postRegistration.apply(this._component, [this._registration]);
      }
      return true;
    };
    ProvidedService.prototype._unregister = function() {
      if (!(this._registration != null)) {
        return false;
      }
      if (this._preUnregistration != null) {
        this._preUnregistration.apply(this._component, [this._registration]);
      }
      this._hub.unregisterService(this._registration);
      this._registration = null;
      if (this._postUnRegistration != null) {
        return this._postUnRegistration.apply(this._component, []);
      }
    };
    ProvidedService.prototype.onStart = function() {};
    ProvidedService.prototype.onStop = function() {
      return this._unregister();
    };
    ProvidedService.prototype.onValidation = function() {
      return this._register();
    };
    ProvidedService.prototype.onInvalidation = function() {
      return this._unregister();
    };
    return ProvidedService;
  })();
  HUBU.ServiceOrientation = ServiceOrientation = (function() {
    ServiceOrientation.prototype._hub = null;
    ServiceOrientation.prototype._registry = null;
    /*
      # An array of { component -> service component }.
      # To keep things simple, a component can have only one service component
      */
    ServiceOrientation.prototype._components = [];
    function ServiceOrientation(hubu) {
      var registry, self;
      this._hub = hubu;
      this._registry = new SOC.ServiceRegistry(this._hub);
      this._components = [];
      registry = this._registry;
      self = this;
      this._hub.getServiceRegistry = function() {
        return registry;
      };
      this._hub.registerService = function(component, contract, properties, svcObject) {
        return registry.registerService(component, contract, properties, svcObject);
      };
      this._hub.unregisterService = function(registration) {
        return registry.unregisterService(registration);
      };
      this._hub.getServiceReferences = function(contract, filter) {
        return registry.getServiceReferences(contract, filter);
      };
      this._hub.getServiceReference = function(contract, filter) {
        var refs;
        refs = registry.getServiceReferences(contract, filter);
        if (refs.length !== 0) {
          return refs[0];
        }
        return null;
      };
      this._hub.getService = function(component, reference) {
        return registry.getService(component, reference);
      };
      this._hub.ungetService = function(component, reference) {
        return registry.ungetService(component, reference);
      };
      this._hub.registerServiceListener = function(listenerConfiguration) {
        return registry.registerServiceListener(listenerConfiguration);
      };
      this._hub.unregisterServiceListener = function(listenerConfiguration) {
        return registry.unregisterServiceListener(listenerConfiguration);
      };
      this._hub.requireService = function(description) {
        self.requireService(description);
        return this;
      };
      this._hub.provideService = function(description) {
        self.provideService(description);
        return this;
      };
    }
    /* End of constructor  */
    /*
      # The given component is unregistered from the hub. We needs to unregisters all services.
      */
    ServiceOrientation.prototype.unregisterComponent = function(cmp) {
      var entry, _i, _len, _ref;
      _ref = this._components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (entry.component === cmp) {
          entry.serviceComponent.onStop();
          HUBU.UTILS.removeElementFromArray(this._components, entry);
        }
      }
      return this._registry.unregisterServices(cmp);
    };
    ServiceOrientation.prototype.requireService = function(description) {
      var aggregate, bind, component, contract, field, filter, optional, req, unbind;
      component = description.component, contract = description.contract, filter = description.filter, aggregate = description.aggregate, optional = description.optional, field = description.field, bind = description.bind, unbind = description.unbind;
      if (!(component != null)) {
        throw new Exception("Cannot require a service without a valid component");
      }
      if (aggregate == null) {
        aggregate = false;
      }
      if (optional == null) {
        optional = false;
      }
      if (contract == null) {
        contract = null;
      }
      if (filter == null) {
        filter = null;
      }
      if (!(field != null) && !(bind != null)) {
        throw new Exception("Cannot require a service - field or bind must be set");
      }
      if (field == null) {
        field = null;
      }
      if (bind == null) {
        bind = null;
      }
      if (unbind == null) {
        unbind = null;
      }
      req = new HUBU.ServiceDependency(component, contract, filter, aggregate, optional, field, bind, unbind, this._hub);
      return this._addServiceDependencyToComponent(component, req);
    };
    ServiceOrientation.prototype.provideService = function(description) {
      var component, contract, postRegistration, postUnregistration, preRegistration, preUnregistration, properties, ps;
      component = description.component, contract = description.contract, properties = description.properties, preRegistration = description.preRegistration, postRegistration = description.postRegistration, preUnregistration = description.preUnregistration, postUnregistration = description.postUnregistration;
      if (!(component != null)) {
        throw new Exception("Cannot provided a service without a valid component");
      }
      if (!(contract != null)) {
        throw new Exception("Cannot provided a service without a valid contract");
      }
      if (properties == null) {
        properties = {};
      }
      ps = new HUBU.ProvidedService(component, contract, properties, preRegistration, postRegistration, preUnregistration, postUnregistration, this._hub);
      return this._addProvidedServiceToComponent(component, ps);
    };
    ServiceOrientation.prototype._addServiceDependencyToComponent = function(comp, req) {
      var cmpEntry, entry, newComponent, _i, _len, _ref;
      newComponent = false;
      _ref = this._components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (entry.component === comp) {
          cmpEntry = entry;
        }
      }
      if (!(cmpEntry != null)) {
        cmpEntry = {
          'component': comp,
          'serviceComponent': new HUBU.ServiceComponent(comp)
        };
        this._components.push(cmpEntry);
        newComponent = true;
      }
      cmpEntry.serviceComponent.addRequiredService(req);
      if (newComponent && this._hub.isStarted()) {
        return cmpEntry.serviceComponent.onStart();
      }
    };
    ServiceOrientation.prototype._addProvidedServiceToComponent = function(comp, ps) {
      var cmpEntry, entry, newComponent, _i, _len, _ref;
      newComponent = false;
      _ref = this._components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        if (entry.component === comp) {
          cmpEntry = entry;
        }
      }
      if (!(cmpEntry != null)) {
        cmpEntry = {
          'component': comp,
          'serviceComponent': new HUBU.ServiceComponent(comp)
        };
        this._components.push(cmpEntry);
        newComponent = true;
      }
      cmpEntry.serviceComponent.addProvidedService(ps);
      if (this._hub.isStarted() && newComponent) {
        return cmpEntry.serviceComponent.onStart();
      }
    };
    ServiceOrientation.prototype.start = function() {
      var entry, _i, _len, _ref, _results;
      _ref = this._components;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        _results.push(entry.serviceComponent.onStart());
      }
      return _results;
    };
    ServiceOrientation.prototype.stop = function() {
      var entry, _i, _len, _ref, _results;
      _ref = this._components;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        entry = _ref[_i];
        _results.push(entry.serviceComponent.onStop());
      }
      return _results;
    };
    return ServiceOrientation;
  })();
  /* End of the Service Orientation Extension class  */
  getHubuExtensions().service = ServiceOrientation;
}).call(this);

(function() {
  /*
  # Hub Class
  */
  /*
  # The Hub Class.
  */
  var Hub;
  HUBU.Hub = Hub = (function() {
    /*
      # The component plugged to the hub.
      # @type {Array}
      # @private
      */    Hub.prototype._components = null;
    /*
      # Is the hub started.
      # @private
      */
    Hub.prototype._started = false;
    /*
      # The list of extensions plugged on this hub.
      # The extensions are created on the first hub access (either `start` or `registerComponent`)
      */
    Hub.prototype._extensions = null;
    function Hub() {
      this._components = [];
      this._started = false;
      this._extensions = null;
    }
    Hub.prototype._initialize = function() {
      var ext, name, _ref, _results;
      this._extensions = [];
      _ref = getHubuExtensions();
      _results = [];
      for (name in _ref) {
        ext = _ref[name];
        _results.push(this._extensions.push(new ext(this)));
      }
      return _results;
    };
    /*
      # Gets all plugged components.
      # *Do not modified the result !*
      # @return the list of plugged components.
      */
    Hub.prototype.getComponents = function() {
      return this._components;
    };
    /*
      # Looks for one specific component plugged to the hub.
      # This lookup is based on the component 'getComponentName' method.
      # @param {String} name the component name
      # @return the component with the matching name or `null` if the component is not plugged.
      */
    Hub.prototype.getComponent = function(name) {
      var cmp, fc, n, _i, _len, _ref;
      if (!(name != null)) {
        return null;
      }
      _ref = this._components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cmp = _ref[_i];
        fc = cmp.getComponentName;
        if ((fc != null) && HUBU.UTILS.isFunction(fc)) {
          n = fc.apply(cmp, []);
          if (n === name) {
            return cmp;
          }
        }
      }
      return null;
    };
    /*
      # Registers a new component on the hub.
      # If the component already exists, the registration is ignored. The lookup is based on the `getComponentName` method.
      # This method allows to configure the component.Once successfully registered, the hub call the 'configure' method on
      # the component passing a reference on the hub and the configuration to the component.
      # If component is `null`, the method throws an exception.
      # @param {HUBU.AbstractComponent} component the component to register
      # @param {Object} configuration the component configuration (optional).
      # If the configuration contain the 'component_name' key, the component takes this name.
      # @return the current hub
      */
    Hub.prototype.registerComponent = function(component, configuration) {
      /* Validation */
      var ext, _i, _len, _ref;
      if (!(component != null)) {
        throw new Exception("Cannot register component - component is null");
      }
      if (!HUBU.UTILS.isComponent(component)) {
        if (component.getComponentName) {
          throw new Exception(component.getComponentName() + " is not a valid component");
        } else {
          throw new Exception(component + " is not a valid component");
        }
      }
      /* End of Validation */
      if (this._extensions === null) {
        this._initialize();
      }
      if (this.getComponent(component.getComponentName()) != null) {
        HUBU.logger.info("Component " + component.getComponentName() + " already registered");
        return this;
      }
      this._components.push(component);
      if ((configuration != null) && (configuration.component_name != null)) {
        component["__name__"] = configuration.component_name;
        component.getComponentName = function() {
          return this["__name__"];
        };
      }
      if (!(component.__hub__ != null) && !(component.hub != null)) {
        component.__hub__ = this;
        component.hub = function() {
          return this.__hub__;
        };
      }
      HUBU.logger.debug("Registering component " + component.getComponentName());
      _ref = this._extensions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ext = _ref[_i];
        HUBU.UTILS.invoke(ext, "registerComponent", [component, configuration]);
      }
      HUBU.logger.debug("Configuring component " + component.getComponentName());
      component.configure(this, configuration);
      if (this._started) {
        HUBU.logger.debug("Starting component " + component.getComponentName());
        component.start();
      }
      HUBU.logger.debug("Component " + component.getComponentName() + " registered");
      return this;
    };
    /*
      # Unregisters the given component.
      # If the component is not plugged to the hub, this method does nothing.
      # @param {Object} component either the component object ({HUBU.AbstractComponent})
      # or the component name {String}
      # @return the current hub.
      */
    Hub.prototype.unregisterComponent = function(component) {
      var cmp, ext, idx, _i, _len, _ref;
      if (!(component != null)) {
        return this;
      }
      cmp = null;
      if (HUBU.UTILS.typeOf(component) === "string") {
        cmp = this.getComponent(component);
        if (!(cmp != null)) {
          return this;
        }
      } else {
        if (!HUBU.UTILS.isComponent(component)) {
          throw new Exception("Cannot unregister component, it's not a valid component").add("component", component);
        } else {
          cmp = component;
        }
      }
      if (this._extensions === null) {
        this._initialize();
      }
      idx = HUBU.UTILS.indexOf(this._components, cmp);
      if (idx !== -1) {
        _ref = this._extensions;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          ext = _ref[_i];
          HUBU.UTILS.invoke(ext, "unregisterComponent", [cmp]);
        }
        cmp.stop();
        this._components.splice(idx, 1);
      } else {
        HUBU.logger.info("Component " + cmp.getComponentName() + " not unregistered - not on the hub");
      }
      return this;
    };
    /*
      # Starts the hub.
      # This method calls start on all plugged components.
      # This method does nothing is the hub is already started.
      # @return the hub
      */
    Hub.prototype.start = function() {
      var cmp, ext, _i, _j, _len, _len2, _ref, _ref2;
      if (this._started) {
        return this;
      }
      if (this._extensions === null) {
        this._initialize();
      }
      _ref = this._extensions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ext = _ref[_i];
        HUBU.UTILS.invoke(ext, "start", []);
      }
      this._started = true;
      _ref2 = this._components;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        cmp = _ref2[_j];
        cmp.start();
      }
      return this;
    };
    /*
      # Stops the hub.
      # This method calls stop on all plugged components.
      # If the hub is not started, this methods does nothing.
      # @return the hub
      */
    Hub.prototype.stop = function() {
      var cmp, ext, _i, _j, _len, _len2, _ref, _ref2;
      if (!this._started) {
        return this;
      }
      this._started = false;
      _ref = this._components;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cmp = _ref[_i];
        cmp.stop();
      }
      _ref2 = this._extensions;
      for (_j = 0, _len2 = _ref2.length; _j < _len2; _j++) {
        ext = _ref2[_j];
        HUBU.UTILS.invoke(ext, "start", []);
      }
      return this;
    };
    /*
      # Checks whether the hub is started
      */
    Hub.prototype.isStarted = function() {
      return this._started;
    };
    /*
      # For testing purpose only !
      # Resets the hub.
      */
    Hub.prototype.reset = function() {
      var ext, _i, _len, _ref;
      this.stop();
      if (this._extensions === null) {
        this._initialize();
      }
      _ref = this._extensions;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        ext = _ref[_i];
        HUBU.UTILS.invoke(ext, "reset", []);
      }
      this._components = [];
      this._extensions = null;
      return this;
    };
    return Hub;
  })();
  /* End of th Hub Class */
  /* Create the main Global hub, and the `hub` alias */
  getGlobal().hub = new HUBU.Hub();
}).call(this);

