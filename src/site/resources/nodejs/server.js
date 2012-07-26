var http = require("http");
var contracts = require("./contracts");

exports.component = {
    _port:8888,
    router : null,
    configure:function (hub, configuration) {
        if (configuration != undefined && configuration.port != undefined) {
            this._port = configuration.port;
        }

        hub.requireService({
            contract:contracts.router,
            component:this,
            field:"router"
        });
    },

    start : function() {
        http.createServer(this.router.onRequest).listen(this._port);
        console.log("Server started on port " + this._port);
    },

    stop : function() {},

    getComponentName : function() { return "server"; }

};