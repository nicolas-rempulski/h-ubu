var contracts = require("./contracts");

exports.component = {
    getComponentName: function() {
        return "contact page"
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
        return "Want more info, contact me at clement[DOT]escoffier[AT]gmail[DOT]com";
    },
    path : function() {
        return "/contact";
    }
};