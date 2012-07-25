/**
 * H-Ubu demo.
 * This is a simple frontend component.
 * @author clement
 */

define(["./UserServiceContract"], function (contract) {
    return {

        hub:null,

        /**
         * The login button id
         */
        loginId:null,

        /**
         * The logout button id
         */
        logoutId:null,

        /**
         * The status message id
         */
        statusId:null,

        /**
         * The user service
         */
        userService:null,

        //*********************//
        // Component Interface //
        //*********************//
        /**
         * Method returning the component <b>unique</b>
         * name. Using a fully qualified name is encouraged.
         * @return the component unique name
         */
        getComponentName:function () {
            return 'frontend-component';
        },

        /**
         * Configure method. This method is called when the
         * component is registered on the hub.
         * @param theHub the hub
         * @param configuration the configuration
         */
        configure:function (theHub, configuration) {
            this.hub = theHub;

            // Configuration
            this.loginId = configuration.loginId;
            this.logoutId = configuration.logoutId;
            this.statusId = configuration.statusId;

            // We require the UserServiceContract, it will be injected in the 'userService' field.
            this.hub.requireService({
                component:this,
                contract:contract,
                field:"userService"
            });

        },

        /**
         * The Start function
         * This method is called when the hub starts or just
         * after configure is the hub is already started.
         */
        start:function () {
            // The first things to do is to get the user service and ask if we're
            // logged in
            var state = this.userService.isLoggedIn();

            this.updateStatus(state);

            // Then, we register a listener
            this.hub.subscribe(this, "/user/login", this.callback);

            // Finally we register click event
            svc = this.userService;
            $(this.loginId).click(function () {
                svc.login('bla');
            });

            $(this.logoutId).click(function () {
                svc.logout();
            });
        },

        /**
         * The Stop method is called when the hub stops or
         * just after the component removal if the hub is
         * not stopped. No events can be send in this method.
         */
        stop:function () {

        },

        /**
         * Function called when we receive an event
         */
        callback:function (event) {
            console.log("receive an event " + event.topic + " - " + event.loggedIn);
            this.updateStatus(event.loggedIn);
        },

        updateStatus:function (logged) {
            if (logged) {
                $(this.statusId).html('We are logged in').css('color', 'green');
            } else {
                $(this.statusId).html('We are not logged in').css('color', 'red');
            }
        }
    }
});

