(function(){
  var Deferrable, _a, cleaned, done, failures, func, name, print, puts, stats, sys;
  var __slice = Array.prototype.slice, __hasProp = Object.prototype.hasOwnProperty;
  /*
  This test can run both in the browser and on CommonJS (run `rake test` for node.js)
  */
  if (typeof require !== "undefined" && require !== null) {
    Deferrable = require('../lib/deferrable');
    sys = require('sys');
    stats = '';
    failures = [];
    try {
      sys = require('sys');
      print = sys.print;
      puts = sys.puts;
    } catch (e) {
      print = require('system').stdout.print;
      puts = function() {
        var _c, _d, _e, _f, val, values;
        var _a = arguments.length, _b = _a >= 1;
        values = __slice.call(arguments, 0, _a - 0);
        _c = []; _e = values;
        for (_d = 0, _f = _e.length; _d < _f; _d++) {
          val = _e[_d];
          _c.push(print("" + val + "\n"));
        }
        return _c;
      };
    }
    _a = require('./qunit');
    for (name in _a) { if (__hasProp.call(_a, name)) {
      func = _a[name];
      (this[name] = func);
    }}
    cleaned = function(string) {
      return string.replace(/<span[^>]*>/gi, '').replace(/<\/span>,?\s*/gi, "\n    ");
    };
    QUnit.log = function(result, message) {
      if (!(result)) {
        failures.push(cleaned(message));
      }
      return print(result ? '.' : 'F');
    };
    QUnit.done = function(failures, total) {
      stats = ("" + total + " examples, " + failures + " failures");
      return stats;
    };
    done = function() {
      print("\n\n");
      if (failures.length > 0) {
        puts.apply(this, ['Failures:', ''].concat(failures).concat(['']));
      }
      return puts(stats);
    };
  } else {
    Deferrable = window.Deferrable;
    done = function() {    };
  }
  test('should not call onSuccess if not yet succeeded', function() {
    var callback, called, deferrable;
    deferrable = new Deferrable();
    callback = deferrable.callback();
    called = false;
    deferrable.onSuccess(function() {
      called = true;
      return called;
    });
    return ok(!called, 'expected callback not to be called');
  });
  test('should call onSuccess closure after callback has been called', function() {
    var callback, called, deferrable;
    deferrable = new Deferrable();
    callback = deferrable.callback();
    called = false;
    deferrable.onSuccess(function() {
      called = true;
      return called;
    });
    ok(!called, 'expected callback not to be called');
    callback();
    return ok(called, 'expected callback to be called');
  });
  test('should allow adding onSuccess closure after callback has been called', function() {
    var callback, called, deferrable;
    deferrable = new Deferrable();
    callback = deferrable.callback();
    called = false;
    callback();
    deferrable.onSuccess(function() {
      called = true;
      return called;
    });
    return ok(called, 'expected callback to be called');
  });
  test('should allow multiple callbacks for one deferrable', function() {
    var called, deferrable, first, second;
    deferrable = new Deferrable();
    first = deferrable.callback();
    second = deferrable.callback();
    called = false;
    deferrable.onSuccess(function() {
      called = true;
      return called;
    });
    first();
    ok(!called, 'expected callback not to be called');
    second();
    return ok(called, 'expected callback to be called');
  });
  test('callbacks do not have to arrive in order', function() {
    var called, deferrable, first, second;
    deferrable = new Deferrable();
    first = deferrable.callback();
    second = deferrable.callback();
    called = false;
    deferrable.onSuccess(function() {
      called = true;
      return called;
    });
    second();
    ok(!called, 'expected callback not to be called');
    first();
    return ok(called, 'expected callback to be called');
  });
  test('callbacks may be called more than once', function() {
    var called, deferrable, first, second;
    deferrable = new Deferrable();
    first = deferrable.callback();
    second = deferrable.callback();
    called = false;
    deferrable.onSuccess(function() {
      called = true;
      return called;
    });
    second();
    ok(!called, 'expected callback not to be called');
    second();
    ok(!called, 'expected callback not to be called');
    first();
    return ok(called, 'expected callback to be called');
  });
  test('auto-firing can be surpressed for a onSuccess closure', function() {
    var callback, called, deferrable;
    deferrable = new Deferrable();
    callback = deferrable.callback();
    called = false;
    callback();
    deferrable.onSuccess((function() {
      called = true;
      return called;
    }), {
      fire: false
    });
    ok(!called, 'expected callback not to be called');
    deferrable.fire();
    return ok(called, 'expected callback to be called');
  });
  test('auto-firing can be surpressed for all onSuccess closures', function() {
    var callback, called, deferrable;
    deferrable = new Deferrable({
      autoFire: false
    });
    callback = deferrable.callback();
    called = false;
    callback();
    deferrable.onSuccess(function() {
      called = true;
      return called;
    });
    ok(!called, 'expected callback not to be called');
    deferrable.fire();
    return ok(called, 'expected callback to be called');
  });
  test('callbacks cannot be added after firing the deferrable', function() {
    var deferrable, error;
    deferrable = new Deferrable();
    error = false;
    deferrable.fire();
    ok(deferrable.succeeded(), 'deferrable should have succeeded');
    try {
      deferrable.callback();
    } catch (e) {
      error = true;
    }
    return ok(error, 'expected callback() to throw an error');
  });
  test('callbacks can be added after adding an onSuccess closure without firing', function() {
    var callback, called, deferrable, error;
    deferrable = new Deferrable();
    error = false;
    called = false;
    deferrable.onSuccess((function() {
      called = true;
      return called;
    }), {
      fire: false
    });
    try {
      callback = deferrable.callback();
    } catch (e) {
      error = true;
    }
    ok(!error, 'expected callback() to not throw an error');
    ok(!called, 'expected callback not to be called');
    deferrable.fire();
    try {
      deferrable.callback();
    } catch (e) {
      error = true;
    }
    ok(error, 'expected callback() to throw an error');
    ok(!called, 'expected callback not to be called');
    callback();
    return ok(called, 'expected callback to be called');
  });
  test('deferrables can store callback arguments', function() {
    var called, deferrable;
    deferrable = new Deferrable();
    called = false;
    deferrable.callback('something')(42);
    deferrable.onSuccess(function(args) {
      equals(args.something[0], 42, 'expected return value to be stored');
      called = true;
      return called;
    });
    return ok(called, 'expected callback to be called');
  });
  test('deferrables can store multiple callback arguments', function() {
    var called, deferrable;
    deferrable = new Deferrable();
    called = false;
    deferrable.callback('something')(42, {
      x: Deferrable
    });
    deferrable.onSuccess(function(args) {
      equals(args.something[0], 42, 'expected first return value to be stored');
      equals(args.something[1].x, Deferrable, 'expected second return value to be stored');
      called = true;
      return called;
    });
    return ok(called, 'expected callback to be called');
  });
  test('deferrables can store arguments from multiple callbacks', function() {
    var called, deferrable;
    deferrable = new Deferrable();
    called = false;
    deferrable.callback('something')(42, {
      x: Deferrable
    });
    deferrable.callback('different')("foo");
    deferrable.onSuccess(function(args) {
      equals(args.something[0], 42, 'expected first return value to be stored');
      equals(args.something[1].x, Deferrable, 'expected second return value to be stored');
      equals(args.different[0], "foo", 'expected second return value to be stored');
      called = true;
      return called;
    });
    return ok(called, 'expected callback to be called');
  });
  test('named and unnamed callbacks can be mixed', function() {
    var callback, called, deferrable;
    deferrable = new Deferrable();
    called = false;
    callback = deferrable.callback();
    deferrable.callback('something')(42, {
      x: Deferrable
    });
    deferrable.callback('different')("foo");
    deferrable.onSuccess(function(args) {
      equals(args.something[0], 42, 'expected first return value to be stored');
      equals(args.something[1].x, Deferrable, 'expected second return value to be stored');
      equals(args.different[0], "foo", 'expected second return value to be stored');
      called = true;
      return called;
    });
    ok(!called, 'expected callback not to be called');
    callback();
    return ok(called, 'expected callback to be called');
  });
  done();
})();
