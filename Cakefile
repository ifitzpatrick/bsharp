sealdeal = require "sealdeal"

task "build", "build bsharp.js to lib", ->
  sealdeal.mkdirRecursive "lib"
  sealdeal.writeFileRecursive "lib/bsharp.js",
    sealdeal.concatJSDir "src/js/app"

