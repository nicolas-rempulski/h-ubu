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

var url = require("url");
var contracts = require("./contracts");

var component = {
    errorHandler : null,
    pages : [],
    configure:function (hub) {
        hub
            .provideService({
                contract:contracts.router,
                component:this
            })
            .requireService({
                contract:contracts.error,
                component:this,
                optional:true,
                field:"errorHandler"
            })
            .requireService({
                contract : contracts.page,
                component: this,
                optional : false,
                aggregate: true,
                field : "pages"
            });
    },
    start : function() { console.log("Router started"); },
    stop : function() { console.log("Router stopped"); },
    getComponentName : function() { return "router"; },

    // Contract implementation
    onRequest : function(request, response) {
        var pathname = url.parse(request.url).pathname;
        console.log("Request for " + pathname + " received.");

        // Check if we have a page
        for ( var i = 0; i < this.pages.length; i++) {
            if (this.pages[i].path() === pathname) {
                console.log("Matching page service found");
                // Render the page and return
                response.writeHead(200, {"Content-Type":"text/plain"});
                response.write(this.pages[i].render());
                response.end();
                return;
            }
        }

        // Not Found
        console.log("Page not found...");
        var message = "Page not found";
        if (this.errorHandler != null) {
            message = this.errorHandler.render();
        }
        response.writeHead(404, {"Content-Type":"text/plain"});
        response.write(message);
        response.end();
    }
};

exports.component = component;