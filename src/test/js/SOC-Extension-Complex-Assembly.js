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

describe("H-UBU Service Extension Tests - Complex Assembly Test", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should support complex assembly", function() {
        var mngtContract = {
            doManagement : function() {}
        };

        var uiContract = {
            paint : function() {}
        };

        var mainManager = {
            mainUI : null,
            configure : function(hub) {
                hub.requireService({
                    component: this,
                    contract: uiContract,
                    field : "mainUI",
                    filter: function(ref) { return ref.getProperty("name") === "main-ui" }
                    })
                    .requireService({
                        component: this,
                        contract: mngtContract,
                        field : "mngts",
                        aggregate: true
                    })
                   .provideService({
                        component: this,
                        contract: mngtContract,
                        properties : {
                            name : "main-manager"
                        }
                });

            },
            getComponentName : function() { return "main-manager"},
            start : function() {},
            stop : function() {},
            doManagement : function () {
                return "I'm the manager " + this.getComponentName()
            }
        };

        var mainUI = {
            configure : function(hub) {
                hub.requireService({
                    component: this,
                    contract: uiContract,
                    field : "uis",
                    aggregate: true
                })
                    .provideService({
                        component: this,
                        contract: uiContract,
                        properties : {
                            name : "main-ui"
                        }
                    });

            },
            getComponentName : function() { return "main-ui"},
            start : function() {},
            stop : function() {},
            paint : function () {
                return "I'm the ui " + this.getComponentName()
            }
        };

        var AManager = {
            configure : function(hub) {
                hub.requireService({
                    component: this,
                    contract: uiContract,
                    field : "AUI",
                    filter: function(ref) { return ref.getProperty("name") === "A-ui" }
                })
                    .provideService({
                        component: this,
                        contract: mngtContract,
                        properties : {
                            name : "A-manager"
                        }
                    });

            },
            getComponentName : function() { return "A-manager"},
            start : function() {},
            stop : function() {},
            doManagement : function () {
                return "I'm the manager " + this.getComponentName()
            }
        }

        var AUI = {
            configure : function(hub) {
                hub
                    .provideService({
                        component: this,
                        contract: uiContract,
                        properties : {
                            name : "A-ui"
                        }
                    });

            },
            getComponentName : function() { return "A-ui"},
            start : function() {},
            stop : function() {},
            paint : function () {
                return "I'm the ui " + this.getComponentName()
            }
        };

        var BManager = {
            configure : function(hub) {
                hub.requireService({
                    component: this,
                    contract: uiContract,
                    field : "BUI",
                    filter: function(ref) { return ref.getProperty("name") === "B-ui" }
                })
                    .provideService({
                        component: this,
                        contract: mngtContract,
                        properties : {
                            name : "B-manager"
                        }
                    });

            },
            getComponentName : function() { return "B-manager"},
            start : function() {},
            stop : function() {},
            doManagement : function () {
                return "I'm the manager " + this.getComponentName()
            }
        }

        var BUI = {
            configure : function(hub) {
                hub
                    .provideService({
                        component: this,
                        contract: uiContract,
                        properties : {
                            name : "B-ui"
                        }
                    });

            },
            getComponentName : function() { return "B-ui"},
            start : function() {},
            stop : function() {},
            paint : function () {
                return "I'm the ui " + this.getComponentName()
            }
        };

        hub
            .registerComponent(mainUI)
            .registerComponent(mainManager)
            .registerComponent(AManager)
            .registerComponent(AUI)
            .registerComponent(BManager)
            .registerComponent(BUI)
            .start();

        expect(mainManager.mainUI.paint()).toBe("I'm the ui main-ui");
        expect(mainManager.mngts.length).toBe(2);

        expect(mainUI.uis.length).toBe(2);

        expect(AManager.AUI.paint()).toBe("I'm the ui A-ui");
        expect(BManager.BUI.paint()).toBe("I'm the ui B-ui");


    });

});