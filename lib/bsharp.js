(function() {
  var Song, SynthSong, addSongGetter, chordType, _i, _len, _ref,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  window.BSharp = {
    util: {
      count: function(str, find) {
        var indexOf, total;
        total = 0;
        while (str) {
          indexOf = str.indexOf(find);
          if (indexOf < 0) {
            break;
          } else {
            total++;
            str = str.slice(indexOf + 1);
          }
        }
        return total;
      },
      sumUntil: function(steps, max) {
        var i, total, _i, _len, _ref;
        if (max == null) {
          max = steps.length;
        }
        total = 0;
        _ref = steps.slice(0, max);
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          total += i;
        }
        return total;
      },
      concatArrays: function() {
        var array, newArray, _i, _len, _ref, _results;
        newArray = [];
        _ref = _.toArray(arguments);
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          array = _ref[_i];
          _results.push(newArray = newArray.concat(array));
        }
        return _results;
      }
    },
    ctx: new webkitAudioContext,
    concertPitch: 440,
    getFrequency: function(steps) {
      return this.concertPitch * Math.pow(2, steps / 12);
    },
    noteNameRegex: /^([A-G])([#b]*)(\d*)$/,
    getNoteNameSteps: function(noteName) {
      var octave, result;
      result = this.noteNameRegex.exec(noteName);
      if (result) {
        noteName = result[1];
        octave = result[3] || 4;
        return this.util.count(result[2], '#') - this.util.count(result[2], 'b') + this.getOctaveOffset(noteName, octave) + this.getNoteNameOffset(noteName);
      } else {
        throw new Error("Illegal note name " + noteName);
      }
    },
    getNoteFrequency: function(noteName) {
      return this.getFrequency(this.getNoteNameSteps(noteName));
    },
    _noteValue: function(noteName) {
      var ACode, noteNameCode;
      noteNameCode = noteName.charCodeAt(0);
      ACode = "A".charCodeAt(0);
      return noteNameCode - ACode;
    },
    getNoteNameOffset: function(noteName) {
      var noteValue;
      noteValue = this._noteValue(noteName);
      return this.util.sumUntil(this.steps.noteNames, noteValue);
    },
    getOctaveOffset: function(noteName, octave) {
      var noteValue;
      noteValue = this._noteValue(noteName);
      return (octave - (noteValue <= 1 ? 4 : 5)) * 12;
    },
    steps: {
      major: [2, 2, 1, 2, 2, 2, 1],
      minor: [2, 1, 2, 2, 1, 2, 2],
      harmonicMinor: [2, 1, 2, 2, 1, 3, 1],
      noteNames: [2, 1, 2, 2, 1, 2, 2]
    },
    createSynthSong: function(notes) {
      var song;
      if (notes == null) {
        notes = [];
      }
      song = new this.SynthSong;
      song.notes = notes;
      return song;
    },
    playNote: function(noteName, length) {
      if (length == null) {
        length = .5;
      }
      return this.createSynthSong([
        {
          value: this.getNoteFrequency(noteName),
          length: length,
          start: 0
        }
      ]).play();
    },
    getScaleSteps: function(note, steps) {
      var currentStep, offsets, step, _i, _len;
      currentStep = this.getNoteNameSteps(note);
      offsets = [currentStep];
      for (_i = 0, _len = steps.length; _i < _len; _i++) {
        step = steps[_i];
        currentStep += step;
        offsets.push(currentStep);
      }
      return offsets;
    },
    getScaleNotes: function(note, steps, length, start) {
      var i, step, _i, _len, _ref, _results;
      if (length == null) {
        length = 1;
      }
      if (start == null) {
        start = 0;
      }
      _ref = this.getScaleSteps(note, steps);
      _results = [];
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        step = _ref[i];
        _results.push({
          value: this.getFrequency(step),
          start: start + i * length,
          length: length
        });
      }
      return _results;
    },
    getScale: function(note, steps, length, start) {
      var notes;
      if (length == null) {
        length = .5;
      }
      if (start == null) {
        start = 0;
      }
      notes = this.getScaleNotes(note, steps, length, start);
      return this.createSynthSong(notes);
    },
    getFullScaleNotes: function(note, steps, length, start) {
      var i, last, note, notes;
      if (start == null) {
        start = 0;
      }
      notes = this.getScaleNotes(note, steps, length, start);
      last = notes[notes.length - 1].start;
      notes = notes.concat((function() {
        var _i, _len, _ref, _results;
        _ref = notes.reverse().slice(1);
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          note = _ref[i];
          _results.push({
            value: note.value,
            start: start + last + (i + 1) * length,
            length: length
          });
        }
        return _results;
      })());
      return notes;
    },
    getFullScale: function(note, steps, length, start) {
      if (start == null) {
        start = 0;
      }
      return this.createSynthSong(this.getFullScaleNotes(note, steps, length, start));
    },
    getChordNotes: function(note, steps, length, start) {
      var step, _i, _len, _results;
      if (length == null) {
        length = 1;
      }
      if (start == null) {
        start = 0;
      }
      _results = [];
      for (_i = 0, _len = steps.length; _i < _len; _i++) {
        step = steps[_i];
        _results.push({
          value: this.getFrequency(step),
          start: start,
          length: length
        });
      }
      return _results;
    },
    getScaleChordNotes: function(note, steps, length, start) {
      var chordSteps, i, notes, scaleSteps;
      scaleSteps = this.getScaleSteps(note, steps);
      chordSteps = (function() {
        var _i, _len, _ref, _results;
        _ref = [0, 2, 4, 7];
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          i = _ref[_i];
          _results.push(scaleSteps[i]);
        }
        return _results;
      })();
      notes = this.getChordNotes(note, chordSteps, length, start);
      return notes;
    },
    getMinorChordNotes: function(note, length, start) {
      return this.getScaleChordNotes(note, this.steps.minor, length, start);
    },
    buildChordFn: function(steps) {
      return function(note, length, start) {
        var notes;
        if (length == null) {
          length = 1;
        }
        if (start == null) {
          start = 0;
        }
        notes = this.getScaleChordNotes(note, steps, length, start);
        return this.createSynthSong(notes);
      };
    },
    buildSequence: function(tuples, defaults) {
      var baseNote, config, currentTime, localDefaults, note, tuple, _i, _len, _results;
      if (defaults == null) {
        defaults = {};
      }
      currentTime = 0;
      localDefaults = {
        value: this.getNoteFrequency("C"),
        length: 1,
        rest: 0
      };
      _results = [];
      for (_i = 0, _len = tuples.length; _i < _len; _i++) {
        tuple = tuples[_i];
        baseNote = {};
        if (tuple[0] != null) {
          baseNote.value = this.getNoteFrequency(tuple[0]);
        }
        if (tuple[1]) {
          baseNote.length = tuple[1];
        }
        if (tuple[2]) {
          baseNote.rest = tuple[2];
        }
        config = tuple[3] || {};
        baseNote.start = currentTime;
        note = _.extend({}, localDefaults, defaults, baseNote, config);
        currentTime += note.length;
        _results.push(note);
      }
      return _results;
    },
    applyTempo: function(length, tempo) {
      return length / (tempo / 60);
    },
    applySequenceTempo: function(notes, tempo) {
      var note, _i, _len;
      for (_i = 0, _len = notes.length; _i < _len; _i++) {
        note = notes[_i];
        note.length = this.applyTempo(note.length, tempo);
        note.start = this.applyTempo(note.start, tempo);
      }
      return notes;
    }
  };

  Song = (function() {

    Song.name = 'Song';

    function Song(ctx) {
      this.ctx = ctx != null ? ctx : BSharp.ctx;
    }

    Song.prototype.build = function() {
      return [];
    };

    Song.prototype.nodes = [];

    Song.prototype.play = function() {
      var node, nodes, _i, _len,
        _this = this;
      nodes = this.build();
      for (_i = 0, _len = nodes.length; _i < _len; _i++) {
        node = nodes[_i];
        node.connect(this.ctx.destination);
      }
      this.nodes = nodes;
      this.ctx.oncomplete = function() {
        return _this.stop();
      };
      return this;
    };

    Song.prototype.stop = function() {
      var node, _i, _len, _ref;
      _ref = this.nodes;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        node.disconnect();
      }
      return this.nodes = [];
    };

    return Song;

  })();

  SynthSong = (function(_super) {

    __extends(SynthSong, _super);

    SynthSong.name = 'SynthSong';

    function SynthSong() {
      return SynthSong.__super__.constructor.apply(this, arguments);
    }

    SynthSong.prototype.build = function() {
      var gainNode, i, note, src, srcs, _i, _len;
      gainNode = this.ctx.createGainNode();
      gainNode.gain.value = .3;
      srcs = (function() {
        var _i, _len, _ref, _results,
          _this = this;
        _ref = this.notes;
        _results = [];
        for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
          note = _ref[i];
          _results.push((function(note) {
            var src;
            src = _this.ctx.createOscillator();
            src.type = 1;
            src.frequency.value = note.value;
            src.noteOn(note.start + _this.ctx.currentTime);
            src.noteOff(note.start + note.length + _this.ctx.currentTime);
            return src;
          })(note));
        }
        return _results;
      }).call(this);
      for (_i = 0, _len = srcs.length; _i < _len; _i++) {
        src = srcs[_i];
        src.connect(gainNode);
      }
      return [gainNode];
    };

    return SynthSong;

  })(Song);

  BSharp.Song = Song;

  BSharp.SynthSong = SynthSong;

  addSongGetter = function(name, fn) {
    BSharp[name + "Notes"] = fn;
    return BSharp[name] = function() {
      return BSharp.createSynthSong(fn.apply(this, arguments));
    };
  };

  BSharp.addSongGetter = addSongGetter;

  addSongGetter("getMajorChord", function(note, length, start) {
    return this.getScaleChordNotes(note, this.steps.major, length, start);
  });

  addSongGetter("getScaleFugue", function(note, steps, length, start) {
    if (note == null) {
      note = "A";
    }
    if (steps == null) {
      steps = BSharp.steps.harmonicMinor;
    }
    if (length == null) {
      length = 1;
    }
    if (start == null) {
      start = 0;
    }
    return BSharp.getFullScaleNotes(note, steps, length, start).concat(BSharp.getFullScaleNotes(note, steps, length, start + length * 2));
  });

  _ref = ["Major", "Minor"];
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    chordType = _ref[_i];
    BSharp["get" + chordType + "Chord"] = BSharp.buildChordFn(BSharp.steps["" + (chordType.toLowerCase())]);
  }

  BSharp.addSongGetter("megaChord", function(note, length, start) {
    var i, notes, _j;
    if (length == null) {
      length = 1;
    }
    if (start == null) {
      start = 0;
    }
    notes = [];
    for (i = _j = 0; _j < 10; i = ++_j) {
      notes = notes.concat(BSharp.getMajorChordNotes(note + i, length, start));
    }
    return notes;
  });

  BSharp.chromaticJam = BSharp.createSynthSong((function() {
    var i, j, name, notes, start, _j, _k, _len1, _ref1;
    notes = [];
    start = 0;
    for (j = _j = 0; _j < 3; j = ++_j) {
      _ref1 = ["C", "C#", "D", "D#"];
      for (i = _k = 0, _len1 = _ref1.length; _k < _len1; i = ++_k) {
        name = _ref1[i];
        notes = notes.concat(BSharp.getMajorChordNotes(name, 1, start));
        start++;
      }
    }
    return notes;
  })());

}).call(this);
