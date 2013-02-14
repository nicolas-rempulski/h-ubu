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

var http = require("http");
var contracts = require("./contracts");

exports.component = {
    _port:8888,
    router : null,
    configure:function (hub, configuration) {
        if (configuration != undefined && configuration.port != undefined) {
            this._port = configuration.port;
        }

        hub.requireService({
            contract:contracts.router,
            component:this,
            field:"router"
        });
    },
    start : function() {
        http.createServer(this.router.onRequest).listen(this._port);
        console.log("Server started on port " + this._port);
    },
    stop : function() {},
    getComponentName : function() { return "server"; }
};