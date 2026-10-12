# Third-party notices

## ModelTrace — xqy2006

Source: https://github.com/xqy2006/ModelTrace

MIT license retained in `LICENSE.ModelTrace`. Snapshot:
`6cd4a8ff0f3f4e49d6d6969dd2fbadfa1569fde2`.
Original core, prompts, browser challenge generator and 18-model bank are
bundled unchanged. The DSH host integration, interface, transport observation,
sampling scheduler and union adapter are maintained by this project.

## Codex Candy Eval — Hao Wang / haowang02

Source: https://github.com/haowang02/cpa-plugin-codex-candy-eval

Copyright (c) 2026 Hao Wang. MIT license retained in `LICENSE.CandyEval`.
Adapted snapshot: `cdd4fb908b03de0659664af3aff363d75a9642b3`.
Rechecked on 2026-10-12 against `0de3802c70cf8ca99b8427f7fd0ee4d0fb292b80`;
the embedded 17-model bank, behavioral probes, 8-model baselines and golden
fixtures remain byte-identical. This project adapts the candy task and matching
rule, answer normalization and statistical attribution for DSH. The JavaScript
permutation test retains 1,000 iterations and the original thresholds, using
CRC32-seeded xorshift32 instead of Go's runtime RNG.

The two original digital banks keep their distinct feature spaces and calibration
parameters. Their 19-model union averages calibrated log-odds centered on the
16 shared reference classes. The fusion has not been independently recalibrated;
upstream cross-validation accuracy is not claimed for it. No reference responses
were invented. Source hashes and commits are in `assets/provenance.json`.

## Feather — Cole Bemis

Source: https://github.com/feathericons/feather, version 4.29.2.
Official SVG icons are bundled under the MIT license in `LICENSE.Feather`.

## Artwork

The Firefly character artwork was supplied as a visual reference by the project
owner. Character artwork and related intellectual property belong to their
respective rights holders and are not included in this project's code MIT grant.
The decorative frames, ribbons, wing mark, candy mark and divider were created
for this interface from the supplied visual direction. Light and dark skins
do not display character artwork. No affiliation with the character's rights
holders or the upstream projects is implied.
