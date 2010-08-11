###
This test can run both in the browser and on CommonJS (run `rake test` for node.js)
###

if require?
  Deferrable = require '../lib/deferrable'
  sys = require 'sys'
  stats = ''
  failures = []
  try
    sys = require('sys')
    print: sys.print
    puts:  sys.puts
  catch e
    print: require('system').stdout.print
    puts: (values...) -> print "$val\n" for val in values
  (this[name] = func) for name, func of require('./qunit')
  cleaned: (string) ->
    string.replace(/<span[^>]*>/gi, '').replace(/<\/span>,?\s*/gi, "\n    ")
  QUnit.log: (result, message) ->
    failures.push cleaned(message) unless result
    print(if result then '.' else 'F')
  QUnit.done: (failures, total) -> stats = "$total examples, $failures failures"
  done: ->
    print "\n\n"
    puts 'Failures:', '', failures..., '' if failures.length > 0
    puts stats
else
  Deferrable = window.Deferrable
  done: ->

test 'should not call onSuccess if not yet succeeded', ->
  deferrable  = new Deferrable
  callback    = deferrable.callback()
  called      = false
  deferrable.onSuccess -> called = true
  ok !called, 'expected callback not to be called'

test 'should call onSuccess closure after callback has been called', ->
  deferrable  = new Deferrable
  callback    = deferrable.callback()
  called      = false
  deferrable.onSuccess -> called = true
  ok !called, 'expected callback not to be called'
  callback()
  ok called, 'expected callback to be called'

test 'should allow adding onSuccess closure after callback has been called', ->
  deferrable  = new Deferrable
  callback    = deferrable.callback()
  called      = false
  callback()
  deferrable.onSuccess -> called = true
  ok called, 'expected callback to be called'

test 'should allow multiple callbacks for one deferrable', ->
  deferrable  = new Deferrable
  first       = deferrable.callback()
  second      = deferrable.callback()
  called      = false
  deferrable.onSuccess -> called = true
  first()
  ok !called, 'expected callback not to be called'
  second()
  ok called, 'expected callback to be called'

test 'callbacks do not have to arrive in order', ->
  deferrable  = new Deferrable
  first       = deferrable.callback()
  second      = deferrable.callback()
  called      = false
  deferrable.onSuccess -> called = true
  second()
  ok !called, 'expected callback not to be called'
  first()
  ok called, 'expected callback to be called'

test 'callbacks may be called more than once', ->
  deferrable  = new Deferrable
  first       = deferrable.callback()
  second      = deferrable.callback()
  called      = false
  deferrable.onSuccess -> called = true
  second()
  ok !called, 'expected callback not to be called'
  second()
  ok !called, 'expected callback not to be called'
  first()
  ok called, 'expected callback to be called'

test 'auto-firing can be surpressed for a onSuccess closure', ->
  deferrable  = new Deferrable
  callback    = deferrable.callback()
  called      = false
  callback()
  deferrable.onSuccess (-> called = true), { fire: false }
  ok !called, 'expected callback not to be called'
  deferrable.fire()
  ok called, 'expected callback to be called'

test 'auto-firing can be surpressed for all onSuccess closures', ->
  deferrable  = new Deferrable { autoFire: false }
  callback    = deferrable.callback()
  called      = false
  callback()
  deferrable.onSuccess -> called = true
  ok !called, 'expected callback not to be called'
  deferrable.fire()
  ok called, 'expected callback to be called'

test 'callbacks cannot be added after firing the deferrable', ->
  deferrable  = new Deferrable
  error       = false
  deferrable.fire()
  ok deferrable.succeeded(), 'deferrable should have succeeded'
  try
    deferrable.callback()
  catch e
    error = true
  ok error, 'expected callback() to throw an error'

test 'callbacks can be added after adding an onSuccess closure without firing', ->
  deferrable  = new Deferrable
  error       = false
  called      = false
  deferrable.onSuccess (-> called = true), { fire: false }
  try
    callback = deferrable.callback()
  catch e
    error = true
  ok !error, 'expected callback() to not throw an error'
  ok !called, 'expected callback not to be called'
  deferrable.fire()
  try
    deferrable.callback()
  catch e
    error = true
  ok error, 'expected callback() to throw an error'
  ok !called, 'expected callback not to be called'
  callback()
  ok called, 'expected callback to be called'

test 'deferrables can store callback arguments', ->
  deferrable  = new Deferrable
  called      = false
  deferrable.callback('something')(42)
  deferrable.onSuccess (args) ->
    equals args.something[0], 42, 'expected return value to be stored'
    called = true
  ok called, 'expected callback to be called'

test 'deferrables can store multiple callback arguments', ->
  deferrable  = new Deferrable
  called      = false
  deferrable.callback('something')(42, {x: Deferrable})
  deferrable.onSuccess (args) ->
    equals args.something[0], 42, 'expected first return value to be stored'
    equals args.something[1].x, Deferrable, 'expected second return value to be stored'
    called = true
  ok called, 'expected callback to be called'

test 'deferrables can store arguments from multiple callbacks', ->
  deferrable  = new Deferrable
  called      = false
  deferrable.callback('something')(42, {x: Deferrable})
  deferrable.callback('different')("foo")
  deferrable.onSuccess (args) ->
    equals args.something[0], 42, 'expected first return value to be stored'
    equals args.something[1].x, Deferrable, 'expected second return value to be stored'
    equals args.different[0], "foo", 'expected second return value to be stored'
    called = true
  ok called, 'expected callback to be called'

test 'named and unnamed callbacks can be mixed', ->
  deferrable  = new Deferrable
  called      = false
  callback    = deferrable.callback()
  deferrable.callback('something')(42, {x: Deferrable})
  deferrable.callback('different')("foo")
  deferrable.onSuccess (args) ->
    equals args.something[0], 42, 'expected first return value to be stored'
    equals args.something[1].x, Deferrable, 'expected second return value to be stored'
    equals args.different[0], "foo", 'expected second return value to be stored'
    called = true
  ok !called, 'expected callback not to be called'
  callback()
  ok called, 'expected callback to be called'

done()
