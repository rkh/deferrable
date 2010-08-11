# deferrable: Callback indirection for JavaScript, version: 0.1.0
# More info: 
# 
# copyright (c) 2010 Konstantin Haase. All rights reserved.
# 
# Developed by: Konstantin Haase
#               http://github.com/rkh/deferrable
# 
# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the "Software"), to
# deal with the Software without restriction, including without limitation the
# rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
# sell copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#   1. Redistributions of source code must retain the above copyright notice,
#      this list of conditions and the following disclaimers.
#   2. Redistributions in binary form must reproduce the above copyright
#      notice, this list of conditions and the following disclaimers in the
#      documentation and/or other materials provided with the distribution.
#   3. Neither the name of Konstantin Haase, nor the names of other contributors
#      may be used to endorse or promote products derived from this Software without
#      specific prior written permission.
# 
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# CONTRIBUTORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
# FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
# WITH THE SOFTWARE.

class Deferrable

  constructor = (options) ->
    @options              = options || { autoFire: true }
    @outstandingCallbacks = []
    @callbacks            = []
    @counter              = 1
    @results              = {}
    @fired                = false

  callback = (name) ->
    throw new Error('Deferrable has already been fired.') if @fired
    name ||= @counter++
    @outstandingCallbacks.push name
    (result...) =>
      index = @outstandingCallbacks.indexOf(name)
      @outstandingCallbacks.splice index, 1 if index > -1
      @results[name] = result
      @onSuccess false, { fire: false }

  succeeded = -> @fired and @outstandingCallbacks.length < 1
  fire = -> @onSuccess false, { fire: true }

  onSuccess = (callback, options) ->
    options ||= { fire: @options.autoFire }
    @callbacks.push callback if callback
    @fired = true if options.fire
    @callbacks.pop()(@results) until @callbacks.length < 1 if @succeeded()
    this

Deferrable.Deferrable = Deferrable # To make sure require('deferrable').Deferrable is always available
exports?.Deferrable   = Deferrable # CommonJS, Modules 1.0
window?.Deferrable    = Deferrable # CommonJS, Modules 1.1-ish (node.js)
module?.exports       = Deferrable # Browser
