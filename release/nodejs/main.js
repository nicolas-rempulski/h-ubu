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

// Loading the hub
require('./hubu-all.js');

var index = require('./index');
var contact = require('./contact');
var contract = require('./contracts');
var server = require('./server');
var router = require('./router-impl');
var error = require('./error');

hub
    .registerComponent(router.component)
    .registerComponent(index.component)
    .registerComponent(server.component)
    .registerComponent(contact.component)
    .registerComponent(error.component)
    .start();