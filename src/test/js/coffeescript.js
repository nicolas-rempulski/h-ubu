/*
 * Copyright 2012 arrow-group
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

describe("CoffeeScript Component Support Test Suite", function () {

    afterEach(function () {
        hub.reset();
    });

    it("should let define component as coffeescript classes", function() {
        var backend = new Backend("backend")

        try {
            hub.registerComponent(backend);
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(1);
            expect(hub.getComponent('backend')).toBe(backend);
            expect(hub.getComponent('backend').doSomething("test")).toBe("backend-test");
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    });

    it("should let bind coffeescript component together", function() {
        var backend = new Backend("backend")
        var frontend = new Frontend("frontend")

        try {
            hub.registerComponent(backend).registerComponent(frontend).bind({
                component: backend,
                to : frontend,
                into : "backend",
                contract: BackendContract
            });
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);
            expect(hub.getComponent('backend')).toBe(backend);
            expect(hub.getComponent('frontend')).toBe(frontend);
            expect(hub.getComponent('backend').doSomething("test")).toBe("backend-test");
            expect(hub.getComponent('frontend').doSomething()).toBe("backend-frontend");
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    });

    it("should let coffeescript classes to be factories", function() {
        try {
            hub
                .createInstance(Backend, {name : "backend"})
                .createInstance(Frontend, {name : "frontend"})
                .bind({
                    component: "backend",
                    to : "frontend",
                    into : "backend",
                    contract: BackendContract
                });
            var cmps = hub.getComponents();
            expect(cmps.length).toBe(2);
            expect(hub.getComponent('backend').doSomething("test")).toBe("backend-test");
            expect(hub.getComponent('frontend').doSomething()).toBe("backend-frontend");
        } catch (e) {
            jasmine.log(e);
            this.fail("Unexpected component reject");
        }
    });

});