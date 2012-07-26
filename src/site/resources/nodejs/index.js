var contracts = require("./contracts");

exports.component = {
    getComponentName: function() {
        return "index page"
    },
    start : function() {},
    stop : function() {},
    configure : function(hub) {
        hub.provideService({
            contract: contracts.page,
            component : this
        });
    },
    render: function() {
        return "Hello, I'm powered by h-ubu and node.js";
    },
    path : function() {
        return "/";
    }
};