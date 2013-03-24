hub.stop()
hub.reset()
scope = @
class scope.testClass
  a: ->

class scope.testClassBis
  b: ->

describe "Proxy with param check", ->

  contract_simple =
    foo: ->
      bar: ["string"]

  contract_multiple =
    foo: ->
      bar: ["string", scope.testClass, "array"]

  contract_complex =
    foo: ->
      bar:
        test: ["string"]

  component_simple =
    getComponentName: ->
      "simple"
    configure: (inHub, config)->
      inHub.provideService
        component: @
        contract: config.contract
    start: ->
    stop: ->
    foo: (inParam)->
      HUBU.logger.log inParam

  component_tester =
    simple: null
    getComponentName: ->
      "tester"
    configure: (inHub, config)->
      inHub.requireService
        component: @
        contract: config.contract
        field: "simple"
    start: ->
    stop: ->
    simpleCall: (inParam)->
      @simple.foo(inParam)

  afterEach ->
    hub.stop()
    hub.reset()

  it "Param Checker should be called if contract provide a model", ->
    spyOn(HUBU.UTILS, "paramChecker")

    hub.registerComponent(component_simple, contract: contract_simple)
    hub.registerComponent(component_tester, contract: contract_simple)
    hub.start()

    valid = ->
      component_tester.simpleCall(bar: "")

    expect(valid).not.toThrow()
    expect(HUBU.UTILS.paramChecker).toHaveBeenCalled()
    return

  it "Param Checker should allow multiple types definition", ->
    hub.registerComponent(component_simple, contract: contract_multiple)
    hub.registerComponent(component_tester, contract: contract_multiple)
    hub.start()

    valid = ->
      component_tester.simpleCall(bar: "")

    expect(valid).not.toThrow()

    valid = ->
      component_tester.simpleCall(bar: new scope.testClass())

    expect(valid).not.toThrow()

    valid = ->
      component_tester.simpleCall(bar: [])

    expect(valid).not.toThrow()

    invalid = ->
      component_tester.simpleCall(bar: new scope.testClassBis())

    expect(invalid).toThrow()

    invalid = ->
      component_tester.simpleCall(bar: /abc/)

    expect(invalid).toThrow()
    return

  it "Param Checker should allow complex types definition", ->
    hub.registerComponent(component_simple, contract: contract_complex)
    hub.registerComponent(component_tester, contract: contract_complex)
    hub.start()

    valid = ->
      component_tester.simpleCall(bar: test: "")

    expect(valid).not.toThrow()

    invalid = ->
      component_tester.simpleCall(bar: test: [])

    expect(invalid).toThrow()

    invalid = ->
      component_tester.simpleCall(bar: a: "")

    expect(invalid).toThrow()

    invalid = ->
      component_tester.simpleCall(bar: [])

    expect(invalid).toThrow()
    return

  return
