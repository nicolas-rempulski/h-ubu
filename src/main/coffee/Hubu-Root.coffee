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
This file defines the ```HUBU``` scope.
###

###*
Store the ```global``` scope.
If 'global' exists use it, else use 'this' (Window object in browser).
This lookup is done to register the ```HUBU``` namespace correctly on the right object.
@global
###
scope = if global? then global else this

###*
The HUBU namespace.
All related objects and classes are created within this namespace, except the global ```hub``` object.
@namespace
@name HUBU
###
scope.HUBU = scope.HUBU ? {}

###*
Extension factory placeholder.
Stores tuples ```extension name -> contructor function```
@memberOf HUBU
###
scope.HUBU.extensions = scope.HUBU.extensions ? {}

###*
Global function to retrieve the ```HUBU``` namespace.
@global
@function
@returns {Object} the HUBU namespace
###
scope.hubu = -> return scope.HUBU

###*
Global function to retrieve the h-ubu's extension placeholder.
@global
@function
@returns {Object} the object storing h-ubu's extensions
###
scope.getHubuExtensions = -> return HUBU.extensions

###*
Global function to retrieve the _global_ scope.
@global
@function
@returns {Object} the global object.
###
scope.getGlobal = -> return scope
