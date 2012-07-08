/*
 * Copyright 2010 akquinet
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

describe("H-UBU Service Extension Tests - Provided Services", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should support adding provided services", function() {
        var contract = {
            doSomething : function() {}
        };

        var component = {
            hub : null,
            configure : function(hub) {
                this.hub = hub;
                this.hub.provideService({
                    component : this,
                    contract: contract
                });
            },
            start : function() {},
            stop : function() {},
            getComponentName : function() { return "my-component"},
            doSomething : function() {
                return "hello";
            }
        };

        hub.registerComponent(component).start();
        expect(hub.getServiceReferences(contract).length).toBe(1);
        hub.unregisterComponent(component);
        expect(hub.getServiceReferences(contract).length).toBe(0);

    });


});