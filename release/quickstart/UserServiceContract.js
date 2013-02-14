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
 * User Service Contract definition.
 * The implementations are empty
 * like a Java interface
 */
var UserServiceContract = {
    /**
     * Checks if the user is logged in.
     */
    isLoggedIn : function() { },
   
    /**
     * Get the logged user.
     */
    getUser : function() { },
   
    /**
     * Ask to log in.
     * This method simulates a async call.
     * And so returns immediately.
     * @param {String} name
     */
    login: function(name) { },
   
    /**
     * Ask to logout in.
     * This method simulates a async call.
     * And so returns immediately.
     */
    logout: function() { }
}