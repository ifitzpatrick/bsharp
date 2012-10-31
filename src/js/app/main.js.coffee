window.BSharp =
  ctx: new webkitAudioContext

class Song
  constructor: (@ctx = BSharp.ctx) ->
  build: -> []
  nodes: []
  play: ->
    nodes = @build()
    (node.connect @ctx.destination for node in nodes)

    @nodes = nodes

  stop: ->
    (node.disconnect() for node in @nodes)
    @nodes = []

class SynthSong extends Song

window.BSharp.Song      = Song
window.BSharp.SynthSong = SynthSong

