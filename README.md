# BSharp - Make beautiful music with the webkit audio api

BSharp is a library that abstracts the webkit audio api, and adds a more
"musical" interface for working with oscillators.

## Classes
 * BSharp.Song - Base class for creating a song from sound nodes and
   attaching them to a context; has play and stop methods.

 * BSharp.SynthSong - Builds on BSharp.Song using a list of note objects to
   contructor oscillator nodes.

## Methods
 * BSharp.createSynthSong(notes) - Convenience factory method for generating
   a SynthSong.

 * BSharp.buildSequence(tuples, defaults) - The first argument should be an
   array of arrays, each of which can have 3 arguments:

     0. Note name - The name of a note in scientific pitch notation i.e. "C5"

     1. Length - The length of the note; by default a length of 1 will produce
        a 1 second long note, but you can use BSharp.applySequenceTempo to the
        notes returned by BSharp.buildSequence so that a length of 1 can
        represent one beat instead.

     2. Rest - Adds a rest at the end of the note, subtracted from the length.
        Defaults to 0.

     3. Config - An object with any additional properties you want added to the
        note object. Currently not very useful, but I plan to added effects, and
        volume adjusting capabilities, so those additional options could be
        included here.

   You may also pass in a defaults object as a second parameter, useful
   for specifying a default note length or rest to add spacing between
   notes.

 * BSharp.applySequenceTempo(notes, tempo) - Adjust note lengths and start
   times so that a length 1 is becomes 1 beat at `tempo` bpm.

 * BSharp.getMajorChordNotes(note, length, start) - Create chord notes for
   a major chord that you can combine with other notes and sequences to make
   songs.

 * BSharp.getMinorChordNotes(note, length, start) - Same as above, but minor
   chord.

 * BSharp.getScaleChordNotes(note, steps, length, start) - Create chord notes
   where `steps` is an array of increments of half steps that will be used to
   calculate the 1st, 3rd, 5th and octave notes of a scale, the create note
   objects from those values.

 * BSharp.getMajorChord(note, length, start) - Creates a SynthSong object of
   a major chord. Intended for demo puposes.

 * BSharp.getMinorChord

 * BSharp.getScaleNotes(note, steps, length, start) - Create note objects
   representing a scale.

## Properties
 * BSharp.steps - An object with properties that are each an array of
   increments in half steps representing the steps of a scale. These arrays
   can be used to construct scales and chords when combined with BSharp methods.

 * BSharp.ctx - A webkitAudioContext instance that is attached to each Song.
   You can override this with a different webkitAudioContext if you have the
   need (you can also override the ctx property on Song objects).

I would like to provide more song construction tools and effects in the future,
as well as a demo application to play with this stuff with some sort of UI.

