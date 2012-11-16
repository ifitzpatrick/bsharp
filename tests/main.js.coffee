describe "octaveOffset: 1/2 steps from A4 of octave using scientific pitch notation", ->
  it "should be 0 for A4 B4 C5 D5", ->
    expect(BSharp.getOctaveOffset "A", 4).toBe 0
    expect(BSharp.getOctaveOffset "B", 4).toBe 0
    expect(BSharp.getOctaveOffset "C", 5).toBe 0
    expect(BSharp.getOctaveOffset "D", 5).toBe 0

  it "should be -12 for A3 C4", ->
    expect(BSharp.getOctaveOffset "A", 3).toBe -12
    expect(BSharp.getOctaveOffset "C", 4).toBe -12

  it "should be 12 for A5", ->
    expect(BSharp.getOctaveOffset "A", 5).toBe 12

describe "noteNameOffset: 1/2 steps for a given note name", ->
  it "should return correct offset", ->
    expect(BSharp.getNoteNameOffset "A").toBe 0
    expect(BSharp.getNoteNameOffset "B").toBe 2
    expect(BSharp.getNoteNameOffset "C").toBe 3
    expect(BSharp.getNoteNameOffset "F").toBe 8

describe "getNoteNameSteps: 1/2 steps for a note in scientific pitch notation", ->
  it "should parse single letter note names", ->
    expect(BSharp.getNoteNameSteps "A").toBe  0
    expect(BSharp.getNoteNameSteps "B").toBe  2
    expect(BSharp.getNoteNameSteps "C").toBe -9

  it "should parse note names + octave", ->
    expect(BSharp.getNoteNameSteps "A4").toBe 0
    expect(BSharp.getNoteNameSteps "B4").toBe 2
    expect(BSharp.getNoteNameSteps "C5").toBe 3

describe "getFrequency: convert 1/2 steps from A4 to frequency", ->
  it "should calculate frequency of note n half steps from A4", ->
    expect(BSharp.getFrequency 0).toBe 440

describe "getNoteFrequency: get frequency from scientific note pitch", ->
  it "should return the frequency of a note in scientific pitch notation", ->
    expect(BSharp.getNoteFrequency "A4").toBe 440

describe "getScaleSteps", ->
  it "should return correct scale steps", ->
    major = BSharp.steps.major
    expect(BSharp.getScaleSteps "A4", major).toEqual [0].concat (for step, i in major
      BSharp.util.sumUntil major, i + 1)

describe "buildSequence", ->
  it "should build an array of notes", ->
    seq = BSharp.buildSequence [
      ["C",  1]
      ["E",  1]
      ["G",  1]
      ["C5", 1]
    ]
