/**
 * Main File.
 * This file loads all components and composed the application.
 *
 * Notice that the contract is loaded by transitivity.
 */

require([
    "components/backendComponent",
    "components/frontendComponent"], function(backend, frontend) {

    $(document).ready(function(){
        // Component registration
        hub
            .registerComponent(backend)
            .registerComponent(frontend, {
                loginId : '#login',
                logoutId : '#logout',
                statusId : '#status'
            })
            .start();
    });
});