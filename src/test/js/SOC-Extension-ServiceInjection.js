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

describe("H-UBU Service Extension Tests - Service Injection and Lifecycle", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should support lifecycle", function() {
        var sumService = {
            sum : function(i1, i2) {}
        };

        var subtractService = {
            subtract : function(i1, i2) {}
        };

        var computationService = {
            compute : function(i1, i2, i3) {}
        };

        var sumServiceProvider = {
            hub: null,
            configure : function(hub) {
                this.hub = hub;
                this.hub.provideService({
                    component: this,
                    contract: sumService
                });
            },
            start : function () {},
            stop : function () {},
            getComponentName : function () { return "sum" },

            sum : function (i1, i2) {
                return i1 + i2;
            }
        };

        var subtractServiceProvider = {
            hub: null,
            configure : function(hub) {
                this.hub = hub;
                this.hub.provideService({
                    component: this,
                    contract: subtractService
                });
            },
            start : function () {},
            stop : function () {},
            getComponentName : function () { return "sub" },

            subtract : function (i1, i2) {
                return i1 - i2;
            }
        };

        var computationServiceProvider = {
            hub: null,
            sum : null,
            subtract : null,
            configure : function(hub) {
                this.hub = hub;
                this.hub
                    .provideService({
                        component: this,
                        contract: computationService
                    })
                    .requireService({
                        component : this,
                        contract : sumService,
                        field : "sum"
                    })
                    .requireService({
                        component : this,
                        contract : subtractService,
                        field : "subtract"
                    });
            },
            start : function () {},
            stop : function () {},
            getComponentName : function () { return "computation-provider" },

            compute : function (i1, i2, i3) {
                return this.subtract.subtract(this.sum.sum(i1, i2), i3);
            }
        };

        var main = {
            hub : null,
            computation : null,
            configure : function(hub) {
                this.hub = hub;
                this.hub
                    .requireService( {
                        component : this,
                        contract: computationService,
                        bind: this.bind,
                        unbind : this.unbind
                    });
            },
            start : function() {},
            stop : function() {},
            getComponentName : function() { return "my-component"},

            bind : function(svc) {
                this.computation = svc;
            },
            unbind : function(svc) {
                this.computation = null;
            },

            doSomething : function() {
                if (this.computation !== null) {
                    var r =  this.computation.compute(3, 2, 1);
                    return r;
                } else {
                    return -1;
                }
            }
        };

        // Registration of all components
        hub
            .registerComponent(main)
            .registerComponent(computationServiceProvider)
            .registerComponent(sumServiceProvider)
            .registerComponent(subtractServiceProvider)
            .start();


        expect(main.doSomething()).toBe(4);
        // Unfortunately sub is leaving
        hub.unregisterComponent(subtractServiceProvider);
        expect(main.doSomething()).toBe(-1);
        // Sub is coming back !
        hub.registerComponent(subtractServiceProvider);
        expect(main.doSomething()).toBe(4);

    });

    it("should support optional dependencies", function() {
        var sumService = {
            sum : function(i1, i2) {}
        };

        var subtractService = {
            subtract : function(i1, i2) {}
        };

        var computationService = {
            compute : function(i1, i2, i3) {}
        };

        var sumServiceProvider = {
            hub: null,
            configure : function(hub) {
                this.hub = hub;
                this.hub.provideService({
                    component: this,
                    contract: sumService
                });
            },
            start : function () {},
            stop : function () {},
            getComponentName : function () { return "sum" },

            sum : function (i1, i2) {
                return i1 + i2;
            }
        };

        var subtractServiceProvider = {
            hub: null,
            configure : function(hub) {
                this.hub = hub;
                this.hub.provideService({
                    component: this,
                    contract: subtractService
                });
            },
            start : function () {},
            stop : function () {},
            getComponentName : function () { return "sub" },

            subtract : function (i1, i2) {
                return i1 - i2;
            }
        };

        var computationServiceProvider = {
            hub: null,
            sum : null,
            subtract : null,
            configure : function(hub) {
                this.hub = hub;
                this.hub
                    .provideService({
                        component: this,
                        contract: computationService
                    })
                    .requireService({
                        component : this,
                        contract : sumService,
                        field : "sum"
                    })
                    .requireService({
                        component : this,
                        contract : subtractService,
                        field : "subtract",
                        optional : true
                    });
            },
            start : function () {},
            stop : function () {},
            getComponentName : function () { return "computation-provider" },

            compute : function (i1, i2, i3) {
                if (this.subtract === null) {
                    return this.sum.sum(i1, i2);
                } else {
                    return this.subtract.subtract(this.sum.sum(i1, i2), i3);
                }
            }
        };

        var main = {
            hub : null,
            computation : null,
            configure : function(hub) {
                this.hub = hub;
                this.hub
                    .requireService( {
                        component : this,
                        contract: computationService,
                        bind: this.bind,
                        unbind : this.unbind
                    });
            },
            start : function() {},
            stop : function() {},
            getComponentName : function() { return "my-component"},

            bind : function(svc) {
                this.computation = svc;
            },
            unbind : function(svc) {
                this.computation = null;
            },

            doSomething : function() {
                if (this.computation !== null) {
                    var r =  this.computation.compute(3, 2, 1);
                    return r;
                } else {
                    return -1;
                }
            }
        };

        // Registration of all components
        hub
            .registerComponent(main)
            .registerComponent(computationServiceProvider)
            .registerComponent(sumServiceProvider)
            .registerComponent(subtractServiceProvider)
            .start();


        expect(main.doSomething()).toBe(4);
        // Unfortunately sub is leaving
        hub.unregisterComponent(subtractServiceProvider);
        // In this case it's an optional dependency returning 5
        expect(main.doSomething()).toBe(5);

        hub.unregisterComponent(sumServiceProvider);
        // This time we're invalid
        expect(main.doSomething()).toBe(-1);

        hub.registerComponent(subtractServiceProvider);
        // Still invalid
        expect(main.doSomething()).toBe(-1);

        hub.registerComponent(sumServiceProvider);
        // Valid again
        expect(main.doSomething()).toBe(4);
    });




});