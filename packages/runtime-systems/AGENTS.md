# Runtime Systems Agent Guide

Runtime systems own RPG rule calculations, not UI.

Rules:

* Keep functions deterministic where possible.
* Do not import React, DOM, Godot, editor UI, or ux-kit.
* Battle work should not touch field/menu/shop unless explicitly requested.
* Inventory work should not implement editor item forms.
* Shop/facility work should not implement save serialization.
* Do not mutate ProjectData here.
