# Deferrable - Callback indirection for CoffeeScript
*If you prefer JavaScript, see [README.md](http://github.com/rkh/deferrable/blob/master/README.md).*

Deferrable adds a layer between you're own callbacks and the hooks calling them. You therefore can use a
callback waiting for multiple events to finish without nesting callbacks. This has the huge advantage of
improving concurrency as events can be processed simultaneously instead of sequentially.

## Basic Usage

Take this example:

    showAnimation -> loadContent -> displayContent()

In that case the animation is happening totally asynchronously, but we don't take advantage of that.
We only start loading content when the animation has finished.

Or would it be smart to load the content first?

    loadContent -> showAnimation -> displayContent()

In that case some time would go by without any visible feedback for the user. Sure, the content comes
right in after playing the animation. But what we really want it to load the content *while* playing the
animation. However, we need both the content to have arrived and the animation to be done *before* we can
display the new content:

    d = new Deferrable
    loadContent d.callback()
    showAnimation d.callback()
    d.onSuccess -> displayContent()

It does not matter which event finishes first and whether that happens before or after calling `onSuccess`.
If both events finish, the `onSuccess` callback will be called exactly once.

This works with as many events as you like.

## Complex Dependencies

Take this code example:

    deferrable  = new Deferrable
    reusable    = deferrable.callback()
    first deferrable.callback()
    second reusable
    third reusable
    deferrable.onSuccess -> something()

In that example `something` will be called as soon as the event `first` and either `second` or `third` have
finished.

It is also possible to have Deferrable depending on each other:

    a = new Deferrable
    b = new Deferrable
    c = new Deferrable
    document.onload = a.callback()
    a.onSuccess b.callback()
    b.onSuccess c.callback()

## Passing Arguments

You probably want to access the arguments passed on by the events. If we take the first example: `loadContent`
is probably handing over the body and header of an AJAX response. In order to do so, we have to name the callbacks:

    deferrable = new Deferrable
    loadContent deferrable.callback('content')
    showAnimation deferrable.callback()
    deferrable.onSuccess (results) ->
      [body, header] = results.content
      displayContent body

## Setup
Download the source from here or install via npm: `npm install deferrable`.

### In the browser
Store [deferrable.js](http://github.com/rkh/deferrable/blob/master/lib/deferrable.js) somewhere and load
into in your page by using `<script src='deferrable.js'></script>`.

### On the server
On Node.js and any other implementation allows replacing `exports`, you can simply do:

    Deferrable = require 'deferrable'

If your platform does not support replacing `exports`, you can *always* use this:

    Deferrable = require('deferrable').Deferrable

## Running the tests

### In the browser
run `rake build` and open `test/deferrable_test.html`.

### On Node.js
run `rake test`.

### On most CommonJS implementation
run `rake build` and open `test/deferrable_test.js`

## Requirements
Supported platforms:

* Any common web browser with js support
** Netscape 4.0 or later
** Internet Explorer 5.5 or later
** Opera 5.12 or later
** Firefox 1.0 or later
** Konqueror 3.1 or later
** Safari
** Chrome
* Any CommonJS implementation supporting Modules 1.x
** CoucheDB 0.11 or later
** Ejscript 2.0 or later
** Flusspferd
** GPSEE
** Narwhal 0.1 or later (0.2 or later recommended)
** Perserve
** RingoJS
** Smart Platform
** SproutCore 1.1 or later
** Wakanda
** Yabble
** node.js
** v8cgi
