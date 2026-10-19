<!-- gardener-maintenance-pr-plan-id: a7bdcad0-12b4-430e-9896-aada66c0fcb4 -->
# Address layer violation repair in src/data

## Goal

1 layer violation repair signal found in src/data.

## Evidence

src/data/entriesStore.ts: Import cycle across 2 files: src/data/entriesStore.ts, src/domain/fire.ts. Categories checked against constitution allowed fixes: layer_violation_repair. Changed paths checked against protected modules and never-touch paths: src/data/entriesStore.ts, src/domain/fire.ts.

## Entropy impact

Expected -28.9 entropy delta across 2 path(s).

## Verification

Required checks: none configured. Risk tier: tier_3_advisory. Minimum opportunity confidence 0.60; threshold 0.40; eligible for review-required PR. Changed paths: src/data/entriesStore.ts, src/domain/fire.ts. Rollback: revert the focused PR branch if checks or review fail.

## ROI impact

Estimated 0.6–1.2 engineering hours saved. 1 high-entropy-delta path(s) addressed. Assumptions: 1.0 hrs/file for layer_violation_repair; confidence 0.60; conservative scale 0.5–1.0×. Estimates are conservative and indicative only.
