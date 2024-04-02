# ComfyKit (for Tampermonkey)

Adds some keybindings for ComfyUI.

* `Alt+Q`: Reset Viewport. Go to 0, 0, at 1.0 scale.
* `Alt+Z`: Cancel current running queue job.

# Setup

You will need to change the `@include` directive of the script if your port
number is different than mine.

# Gotchas

Mac OS sends weird crap when you hold the Alt key down instead of the
normal standard way things expect MODIFIER keys to behave for the past 40
years. The ALT keys do not currently work on Mac unless you change your
keyboard layout from US to "Unicode Hex Input" where it will begin to act like
the keyboard of a real computer. I will deal with Mac's crap eventually I only
use it at work for a few hours a day.
