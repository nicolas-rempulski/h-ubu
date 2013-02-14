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
# Abstract Component class
###

###*
Abstract Component class.
This used is not intended to be used directly, and is just here for documentation purpose. Indeed, the returned object
contains the four required methods that **all** component must have. Any Javascript object with those 4 methods can be
considered as a valid component.

The 4 required methods are:

- `getComponentName()` : return the default component name
- `configurate(hub, [configuration])` : configures the component
- `start()` / `stop()` : called when the component is started / stopped

Returned objects do not intend to be used, they are just mock / empty instances.
@class AbstractComponent
###
HUBU.AbstractComponent = class AbstractComponent

  ###*
  Configures the component.
  This method is called by the hub when the component starts or when the component is plugged when the hub is already started.
  @param hub the hub
  @param configuration optional parameter used to pass the component configuration. The configuration object is a simple
 key/value map.
  @public
  @memberOf AbstractComponent
  ###
  configure : (hub, configuration) -> throw "AbstractComponent is an abstract class";

  ###*
  Starts the component.
  This method is called by the hub when the hub starts or when the component is plugged when the hub is already started.
  This methods is always called after the `configure` method. Once called the component can send events and used bound
  components.
  @public
  @memberOf AbstractComponent
  ###
  start : () -> throw "AbstractComponent is an abstract class";

  ###*
  Stops the component.
  This method is called by the hub when the hub is stopped or when the component is unplugged.
  This methods is always called after the `start` method. Once called, the component must not send events or access bound components.
  @public
  @memberOf AbstractComponent
  ###
  stop : () -> throw "AbstractComponent is an abstract class";

  ###*
  Gets the component name.
  If an 'id' is given in the hub configuration, this method is replaced.
  @return the component name
  @public
  @memberOf AbstractComponent
  ###
  getComponentName : () -> throw "AbstractComponent is an abstract class";