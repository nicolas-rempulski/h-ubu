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

global = exports ? this

global.BackendContract = {
  doSomething : (a) ->
}

###
# A backend class
###
global.Backend = class Backend extends global.BackendContract
  name : null
  logger : null

  constructor : (name) ->
    @name = name
    @logger = new global.Logger("Backend")

  start : -> @logger.info("Backend starting...")

  stop : -> @logger.info("Backend stoping...")

  configure : (hub, config) ->
    if (config?.name?) then @name = config.name

  getComponentName: -> return @name

  doSomething : (a) ->
    @logger.info "Backend is going to do something"
    return @name + "-" + a

###
# A frontend class
###
global.Frontend = class Frontend extends HUBU.AbstractComponent
  name : null
  logger : null
  backend : null  # Injected.

  constructor : (name) ->
    @name = name
    @logger = new global.Logger("Backend")
    @backend = null

  start : -> @logger.info("Backend starting...")

  stop : -> @logger.info("Backend stoping...")

  configure : (hub, config) ->
    if (config?.name?) then @name = config.name

  doSomething :  ->
    @backend.doSomething(@name)

  getComponentName: -> return @name







