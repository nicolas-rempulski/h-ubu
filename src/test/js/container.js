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

describe("Container test suite", function() {
    afterEach(function () {
        hub.reset();
    });

    it("should have the hub injected", function() {
        var cmp = {
            getComponentName: function() {
                return "test"
            },

            start: function() {},
            stop: function() {},
            configure: function() {}
        }

        hub.registerComponent(cmp);
        hub.start();

        expect(cmp.__hub__).toBe(hub);
        expect(cmp.hub()).toBe(hub);
    });

    it("should have the getComponentName injected", function() {
        var cmp = {
            getComponentName: function() {
                return "bad"
            },

            start: function() {},
            stop: function() {},
            configure: function() {}
        };

        hub.registerComponent(cmp, {'component_name': 'good'});
        hub.start();

        expect(cmp.getComponentName()).toBe('good');
    });

    it ("should support the creation of several hubs", function() {
        var cmp = {
            getComponentName: function() {
                return "test"
            },

            start: function() {},
            stop: function() {},
            configure: function() {}
        };

        var cmp2 = {
            getComponentName: function() {
                return "test-2"
            },

            start: function() {},
            stop: function() {},
            configure: function() {}
        };

        var hub1 = new HUBU.Hub();
        var hub2 = new HUBU.Hub();

        hub1.registerComponent(cmp).start();
        hub2.registerComponent(cmp2).start();

        expect(cmp.__hub__).toBe(hub1);
        expect(cmp.hub()).toBe(hub1);

        expect(cmp2.__hub__).toBe(hub2);
        expect(cmp2.hub()).toBe(hub2);

        hub1.stop();
        hub2.stop();

    });

    it ("should not share services between hubs", function() {
        var contract = {
            doSomething : function() {}
        };

        var cmp = {
            getComponentName: function() {
                return "test"
            },

            start: function() {},
            stop: function() {},
            configure: function() {
                this.hub().provideService({
                    contract: contract,
                    component: this
                });
            },
            doSomething : function() {
                return this.getComponentName();
            }
        };

        var cmp2 = {
            getComponentName: function() {
                return "test-2"
            },

            start: function() {},
            stop: function() {},
            configure: function() {
                this.hub().provideService({
                    contract: contract,
                    component: this
                });
            },
            doSomething : function() {
                return this.getComponentName();
            }
        };

        var hub1 = new HUBU.Hub();
        var hub2 = new HUBU.Hub();

        hub1.registerComponent(cmp).start();
        hub2.registerComponent(cmp2).start();

        expect(hub1.getServiceReferences(contract).length).toBe(1);
        expect(hub2.getServiceReferences(contract).length).toBe(1);

        hub1.stop();
        hub2.stop();

    });

    it ("should consider hub as component", function() {
        var contract = {
            doSomething : function() {}
        };

        var cmp = {
            getComponentName: function() {
                return "test"
            },

            start: function() {},
            stop: function() {},
            configure: function() {
                this.hub().provideService({
                    contract: contract,
                    component: this
                });
            },
            doSomething : function() {
                return this.getComponentName();
            }
        };

        var cmp2 = {
            getComponentName: function() {
                return "test-2"
            },

            start: function() {},
            stop: function() {},
            configure: function() {
                this.hub().provideService({
                    contract: contract,
                    component: this
                });
            },
            doSomething : function() {
                return this.getComponentName();
            }
        };

        var hub1 = new HUBU.Hub();
        var hub2 = new HUBU.Hub();

        hub1.registerComponent(cmp).start();
        hub2.registerComponent(cmp2).start();

        expect(hub1.getServiceReferences(contract).length).toBe(1);
        expect(hub2.getServiceReferences(contract).length).toBe(1);

        // Add hub2 to hub1
        hub1.registerComponent(hub2);

        hub1.stop();
        hub2.stop();

    });

    it("must ensure the root hub have the `root` name", function() {
        expect(hub.getComponentName()).toBe("root");
        hub.reset();
        expect(hub.getComponentName()).toBe("root");
    });

    it("must ensure the hub can have name", function() {
        var hub0 = new HUBU.Hub().configure();
        expect(hub0.getComponentName()).toBe("hub"); // No name set

        var hub1 = new HUBU.Hub().start();
        expect(hub1.getComponentName()).toBe("hub"); // No name set

        var hub2 = new HUBU.Hub().configure(null, {component_name: "my hub is bigger than yours"}).start();
        expect(hub2.getComponentName()).toBe("my hub is bigger than yours");

        // We must survive reset
        hub2.reset();
        expect(hub2.getComponentName()).toBe("my hub is bigger than yours");
    });

});