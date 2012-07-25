###
# Detects whether we exports on the Commons.js `exports` object or on `this` (so the Browser `window` object).
###
global = exports ? this

global.HUBU = global.HUBU ? {}

###
# Extension factory placeholder.
# Contains tuple `extension name -> contructor function`
###
global.HUBU.extensions = global.HUBU.extensions ? {}

global.getHubu = -> return global.HUBU
global.getHubuExtensions = -> return HUBU.extensions

global.getGlobal = -> return global

###


