sealdeal = require "sealdeal"
spawn    = require("child_process").spawn

createSealdealTask = (taskName) ->
  ps = spawn "./node_modules/sealdeal/bin/sealdeal", [taskName]

  ps.stdout.setEncoding "utf8"
  ps.stderr.setEncoding "utf8"
  ps.stdout.on "data", (data) -> console.log data
  ps.stderr.on "data", (data) -> console.log data

task "lib:build", "build bsharp.js to lib", ->
  sealdeal.mkdirRecursive "lib"
  sealdeal.writeFileRecursive "lib/bsharp.js",
    sealdeal.concatJSDir "src/js/app"

task "app:server", "run test app server", ->
  createSealdealTask "server"

task "app:build", "build test app", ->
  createSealdealTask "build"

task "test:server", "run testacular server", ->
  createSealdealTask "test-server"

task "test:run", "run jasmine unit tests with testacular", ->
  createSealdealTask "test"

