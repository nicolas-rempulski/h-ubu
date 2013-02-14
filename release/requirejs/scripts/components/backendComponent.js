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

/**
 * H-Ubu demo.
 * This is a simple backend component.
 * @author clement
 */
define(["./UserServiceContract"], function (contract) {
    return {

        hub:null,
        isUserLoggedIn:false,
        user:null,

        // First we are a component, so we need to implement the 4 methods required to be a valid component:

        /**
         * Method returning the component <b>unique</b>
         * name. Using a fully qualified name is encouraged.
         * @return the component unique name
         */
        getComponentName:function () {
            return 'backend-component';
        },

        /**
         * Configure method. This method is called when the
         * component is registered on the hub.
         * @param theHub the hub
         */
        configure:function (theHub) {
            this.hub = theHub;
            // We provide the UserContractService, we got the reference from require.js (contract)
            this.hub.provideService({
                component:this,
                contract:contract
            });
        },

        /**
         * The Start function
         * This method is called when the hub starts or just
         * after configure is the hub is already started.
         */
        start:function () {
        },

        /**
         * The Stop method is called when the hub stops or
         * just after the component removal if the hub is
         * not stopped. No events can be send in this method.
         */
        stop:function () {
        },

        // Now the UserServiceContract implementation:

        /**
         * Checks if the user is logged in.
         */
        isLoggedIn:function () {
            return this.isUserLoggedIn;
        },

        /**
         * Get the logged user.
         */
        getUser:function () {
            return this.user;
        },

        /**
         * Ask to log in.
         * This method simulates a async call.
         * And so returns immediately.
         * @param {String} name
         */
        login:function (name) {
            // Because setTimeout call the mehtod on the global object (window),
            // We use a closure.
            var self = this;
            setTimeout(function () {
                self.loggedIn(name);
            }, 2000);
            return;
        },

        /**
         * Ask to logout in.
         * This method simulates a async call.
         * And so returns immediately.
         */
        logout:function () {
            var self = this;
            setTimeout(function () {
                self.loggedOut();
            }, 1000);
            return;
        },


        // We have two internal/private methods sending events

        /**
         * This method is called 2 seconds after the login request.
         * It's use the hub to inform that the login was successful.
         */
        loggedIn:function (name) {
            this.isLoggedIn = true;
            this.user = name;
            // We send an event notifying other components that we're logged in.
            this.hub.publish(this, "/user/login", {
                loggedIn:true
            });
        },

        loggedOut:function () {
            this.isLoggedIn = false;
            this.user = null;
            // We send an event notifying other components that we're logged out.
            this.hub.publish(this, "/user/login", {
                loggedIn:false
            });
        }
    }
});
