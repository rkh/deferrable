/*
 * deferrable: Callback indirection for JavaScript, version: 0.1.0
 * More info: 
 * 
 * copyright (c) 2010 Konstantin Haase. All rights reserved.
 * 
 * Developed by: Konstantin Haase
 *               http://github.com/rkh/deferrable
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal with the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *   1. Redistributions of source code must retain the above copyright notice,
 *      this list of conditions and the following disclaimers.
 *   2. Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimers in the
 *      documentation and/or other materials provided with the distribution.
 *   3. Neither the name of Konstantin Haase, nor the names of other contributors
 *      may be used to endorse or promote products derived from this Software without
 *      specific prior written permission.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * WITH THE SOFTWARE.
 */
(function(){
  var Deferrable;
  var __slice = Array.prototype.slice;
  Deferrable = function(options) {
    this.options = options || {
      autoFire: true
    };
    this.outstandingCallbacks = [];
    this.callbacks = [];
    this.counter = 1;
    this.results = {};
    this.fired = false;
    return this;
  };
  Deferrable.prototype.callback = function(name) {
    if (this.fired) {
      throw new Error('Deferrable has already been fired.');
    }
    name = name || this.counter++;
    this.outstandingCallbacks.push(name);
    return (function(__this) {
      var __func = function() {
        var index, result;
        var _a = arguments.length, _b = _a >= 1;
        result = __slice.call(arguments, 0, _a - 0);
        index = this.outstandingCallbacks.indexOf(name);
        if (index > -1) {
          this.outstandingCallbacks.splice(index, 1);
        }
        this.results[name] = result;
        return this.onSuccess(false, {
          fire: false
        });
      };
      return (function() {
        return __func.apply(__this, arguments);
      });
    })(this);
  };
  Deferrable.prototype.succeeded = function() {
    return this.fired && this.outstandingCallbacks.length < 1;
  };
  Deferrable.prototype.fire = function() {
    return this.onSuccess(false, {
      fire: true
    });
  };
  Deferrable.prototype.onSuccess = function(callback, options) {
    options = options || {
      fire: this.options.autoFire
    };
    if (callback) {
      this.callbacks.push(callback);
    }
    if (options.fire) {
      this.fired = true;
    }
    if (this.succeeded()) {
      while (!(this.callbacks.length < 1)) {
        this.callbacks.pop()(this.results);
      }
    }
    return this;
  };

  Deferrable.Deferrable = Deferrable;
  typeof exports === "undefined" || exports == undefined ? undefined : exports.Deferrable = Deferrable;
  typeof window === "undefined" || window == undefined ? undefined : window.Deferrable = Deferrable;
  typeof module === "undefined" || module == undefined ? undefined : module.exports = Deferrable;
})();
