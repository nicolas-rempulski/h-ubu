var contracts = require("./contracts");

exports.component = {
    getComponentName: function() {
        return "error handler"
    },
    start : function() {},
    stop : function() {},
    configure : function(hub) {
        hub.provideService({
            contract: contracts.error,
            component : this
        });
    },
    render: function() {
        return "Holy Guacamole ! This page does not exist.";
    }
};