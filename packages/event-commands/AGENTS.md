# Event Commands Agent Guide

Event commands own command definitions/metadata, not execution side effects.

Rules:

* Do not add executable behavior here.
* Execution sequencing belongs in runtime-core.
* Editor forms may consume metadata, but editor UI does not live here.
* Read `docs/runtime/command-sequencing.md` before changing command semantics.
* Do not implement battle formulas or save serialization here.
