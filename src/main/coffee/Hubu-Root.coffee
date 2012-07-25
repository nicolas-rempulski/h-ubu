###
# Detect the 'global' scope.
# If 'global' exists use it, else use 'this' (Window object in browser)
###
scope = if global? then global else this

scope.HUBU = scope.HUBU ? {}

###
# Extension factory placeholder.
# Contains tuple `extension name -> contructor function`
###
scope.HUBU.extensions = scope.HUBU.extensions ? {}

scope.hubu = -> return scope.HUBU
scope.getHubuExtensions = -> return HUBU.extensions

scope.getGlobal = -> return scope

###


