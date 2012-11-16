window.BSharp =
  util:
    count: (str, find) ->
      total = 0
      while str
        indexOf = str.indexOf find
        if indexOf < 0
          break
        else
          total++
          str = str.slice indexOf + 1

      return total

    sumUntil: (steps, max = steps.length) ->
      total = 0
      for i in steps.slice 0, max
        total += i

      return total

    concatArrays: ->
      newArray = []
      for array in _.toArray arguments
        newArray = newArray.concat array

  ctx: new webkitAudioContext
  concertPitch: 440
  getFrequency: (steps) ->
    @concertPitch * Math.pow(2, steps / 12)

  noteNameRegex: /^([A-G])([#b]*)(\d*)$/
  getNoteNameSteps: (noteName) ->
    result = @noteNameRegex.exec noteName
    if result
      noteName = result[1]
      octave   = result[3] or 4

      @util.count(result[2], '#') - @util.count(result[2], 'b') +
        @getOctaveOffset(noteName, octave) +
        @getNoteNameOffset(noteName)

    else
      throw new Error "Illegal note name #{noteName}"

  getNoteFrequency: (noteName) ->
    @getFrequency @getNoteNameSteps noteName

  _noteValue: (noteName) ->
    noteNameCode = noteName.charCodeAt 0
    ACode        = "A".charCodeAt      0

    noteNameCode - ACode

  getNoteNameOffset: (noteName) ->
    noteValue = @_noteValue noteName

    @util.sumUntil @steps.noteNames, noteValue

  getOctaveOffset: (noteName, octave) ->
    noteValue = @_noteValue noteName

    (octave - if noteValue <= 1 then 4 else 5) * 12

  steps:
    major:         [2, 2, 1, 2, 2, 2, 1]
    minor:         [2, 1, 2, 2, 1, 2, 2]
    harmonicMinor: [2, 1, 2, 2, 1, 3, 1]
    noteNames:     [2, 1, 2, 2, 1, 2, 2]

  createSynthSong: (notes = []) ->
    song = new @SynthSong
    song.notes = notes
    return song

  playNote: (noteName, length = .5) ->
    @createSynthSong([
      value:  @getNoteFrequency noteName
      length: length
      start:  0
    ]).play()

  getScaleSteps: (note, steps) ->
    currentStep = @getNoteNameSteps note
    offsets = [currentStep]
    for step in steps
      currentStep += step
      offsets.push currentStep

    return offsets

  getScaleNotes: (note, steps, length = 1, start = 0) ->
    (for step, i in @getScaleSteps(note, steps)
      value:  @getFrequency step
      start:  start + i * length
      length: length
    )

  getScale: (note, steps, length = .5, start = 0) ->
    notes = @getScaleNotes(note, steps, length, start)
    @createSynthSong notes

  getFullScaleNotes: (note, steps, length, start = 0) ->
    notes = @getScaleNotes(note, steps, length, start)

    last  = notes[notes.length - 1].start
    notes = notes.concat (for note, i in notes.reverse().slice(1)
      value:  note.value
      start:  start + last + (i + 1) * length
      length: length
    )

    return notes

  getFullScale: (note, steps, length, start = 0) ->
    @createSynthSong @getFullScaleNotes(note, steps, length, start)

  getChordNotes: (note, steps, length = 1, start = 0) ->
    (for step in steps
      value: @getFrequency step
      start: start
      length: length
    )

  getScaleChordNotes: (note, steps, length, start) ->
    scaleSteps = @getScaleSteps note, steps
    chordSteps = (scaleSteps[i] for i in [0, 2, 4, 7])

    notes = @getChordNotes note, chordSteps, length, start
    return notes

  getMinorChordNotes: (note, length, start) ->
    @getScaleChordNotes note, @steps.minor, length, start

  buildChordFn: (steps) ->
    (note, length = 1, start = 0) ->
      notes = @getScaleChordNotes note, steps, length, start
      @createSynthSong notes

  # note name, length, rest, config
  buildSequence: (tuples, defaults = {}) ->
    currentTime = 0
    localDefaults =
      value:  @getNoteFrequency "C"
      length: 1
      rest:   0

    (for tuple in tuples
      baseNote        = {}
      baseNote.value  = @getNoteFrequency tuple[0] if tuple[0]?
      baseNote.length = tuple[1] if tuple[1]
      baseNote.rest   = tuple[2] if tuple[2]
      config          = tuple[3] or {}
      baseNote.start  = currentTime

      note = _.extend {}, localDefaults, defaults, baseNote, config

      currentTime += note.length

      note
    )

  applyTempo: (length, tempo) ->
    length / (tempo/60)

  applySequenceTempo: (notes, tempo) ->
    for note in notes
      note.length = @applyTempo note.length, tempo
      note.start  = @applyTempo note.start,  tempo

    return notes

class Song
  constructor: (@ctx = BSharp.ctx) ->
  build: -> []
  nodes: []
  play: ->
    nodes = @build()
    (node.connect(@ctx.destination) for node in nodes)

    @nodes = nodes
    @ctx.oncomplete = => @stop()
    return this

  stop: ->
    (node.disconnect() for node in @nodes)
    @nodes = []

class SynthSong extends Song
  build: ->
    gainNode = @ctx.createGainNode()

    gainNode.gain.value = .3

    srcs = (for note, i in @notes
      do (note) =>
        src = @ctx.createOscillator()
        src.type = 1
        src.frequency.value = note.value
        src.noteOn note.start + @ctx.currentTime
        src.noteOff note.start + note.length + @ctx.currentTime
        return src
    )

    (src.connect(gainNode) for src in srcs)

    return [gainNode]

BSharp.Song          = Song
BSharp.SynthSong     = SynthSong

addSongGetter = (name, fn) ->
  BSharp[name + "Notes"] = fn
  BSharp[name] = ->
    BSharp.createSynthSong fn.apply this, arguments

BSharp.addSongGetter = addSongGetter

addSongGetter "getMajorChord", (note, length, start) ->
  @getScaleChordNotes note, @steps.major, length, start

addSongGetter "getScaleFugue",
  (note = "A", steps = BSharp.steps.harmonicMinor, length = 1, start = 0) ->
    BSharp.getFullScaleNotes(note, steps, length, start).concat(
      BSharp.getFullScaleNotes(note, steps, length, start + length * 2))

for chordType in ["Major", "Minor"]
  BSharp["get#{chordType}Chord"] =
    BSharp.buildChordFn BSharp.steps["#{chordType.toLowerCase()}"]

BSharp.addSongGetter "megaChord", (note, length = 1, start = 0) ->
  notes = []
  for i in [0...10]
    notes = notes.concat BSharp.getMajorChordNotes(note + i, length, start)

  return notes

BSharp.chromaticJam = BSharp.createSynthSong do ->
  notes = []
  start = 0
  for j in [0...3]
    for name, i in ["C", "C#", "D", "D#"]
      notes = notes.concat BSharp.getMajorChordNotes(name, 1, start)
      start++

  return notes

