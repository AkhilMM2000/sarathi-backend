#!/usr/bin/env python3
"""
validate_dataset.py - Validation script for A6 LLM Evaluation Dataset.

Verifies:
1. Valid JSON Lines (JSONL) syntax.
2. Presence and types of all mandatory fields.
3. Strict uniqueness of record IDs.
4. Whitelisted provenance categories.
5. Whitelisted difficulty tiers.
6. Evidence references non-empty and well-formatted.
7. Pending state for uncollected model outputs/scores.
8. Source path grounding against repository files.
"""

import json
import os
import sys
import re

ALLOWED_PROVENANCE = {
    "actual_recorded_interaction",
    "reconstructed_workflow_prompt",
    "illustrative_synthetic_test",
}

ALLOWED_DIFFICULTIES = {"Easy", "Medium", "Hard"}

MANDATORY_FIELDS = [
    "id",
    "task_category",
    "prompt",
    "expected_answer",
    "grading_criteria",
    "evidence_references",
    "difficulty",
    "provenance",
    "model_output",
    "score",
]

def validate_dataset(filepath, workspace_root):
    print(f"=== Validating LLM Evaluation Dataset: {filepath} ===")
    
    if not os.path.isfile(filepath):
        print(f"[FAIL] Dataset file not found: {filepath}", file=sys.stderr)
        return False

    seen_ids = set()
    total_records = 0
    errors = []
    warnings = []

    with open(filepath, "r", encoding="utf-8") as f:
        for line_no, raw_line in enumerate(f, start=1):
            line = raw_line.strip()
            if not line:
                continue

            total_records += 1

            # 1. JSON parsing
            try:
                record = json.loads(line)
            except json.JSONDecodeError as e:
                errors.append(f"Line {line_no}: Invalid JSON syntax ({e})")
                continue

            # 2. Mandatory fields check
            for field in MANDATORY_FIELDS:
                if field not in record:
                    errors.append(f"Line {line_no} (ID: {record.get('id', 'UNKNOWN')}): Missing mandatory field '{field}'")

            rec_id = record.get("id")
            if not rec_id:
                errors.append(f"Line {line_no}: Empty or missing 'id'")
            elif rec_id in seen_ids:
                errors.append(f"Line {line_no}: Duplicate ID '{rec_id}' detected")
            else:
                seen_ids.add(rec_id)

            # 3. Provenance validation
            prov = record.get("provenance")
            if prov not in ALLOWED_PROVENANCE:
                errors.append(
                    f"Line {line_no} (ID: {rec_id}): Invalid provenance '{prov}'. "
                    f"Must be one of {sorted(ALLOWED_PROVENANCE)}"
                )

            # 4. Difficulty validation
            diff = record.get("difficulty")
            if diff not in ALLOWED_DIFFICULTIES:
                errors.append(
                    f"Line {line_no} (ID: {rec_id}): Invalid difficulty '{diff}'. "
                    f"Must be one of {sorted(ALLOWED_DIFFICULTIES)}"
                )

            # 5. Model output & score policy
            # If not actual_recorded_interaction, output and score must be pending (None/null)
            if prov != "actual_recorded_interaction":
                if record.get("model_output") is not None:
                    errors.append(
                        f"Line {line_no} (ID: {rec_id}): 'model_output' must be null for non-actual interactions"
                    )
                if record.get("score") is not None:
                    errors.append(
                        f"Line {line_no} (ID: {rec_id}): 'score' must be null for non-actual interactions"
                    )

            # 6. Evidence references validation
            refs = record.get("evidence_references")
            if not isinstance(refs, list) or len(refs) == 0:
                errors.append(f"Line {line_no} (ID: {rec_id}): 'evidence_references' must be a non-empty list")
            else:
                for ref in refs:
                    if not isinstance(ref, str) or not ref.strip():
                        errors.append(f"Line {line_no} (ID: {rec_id}): Invalid empty reference")
                        continue
                    # Extract file path from potential 'path#L10-L20' or 'path:L10'
                    clean_path = re.split(r"[:#]", ref)[0].strip()
                    # Check existence either from workspace root or A6/ root
                    abs_path = os.path.join(workspace_root, clean_path)
                    if not os.path.exists(abs_path):
                        warnings.append(f"Line {line_no} (ID: {rec_id}): Grounding reference not found locally: '{clean_path}'")

            # 7. Prompt & expected answer checks
            prompt = record.get("prompt")
            if not isinstance(prompt, str) or len(prompt.strip()) < 10:
                errors.append(f"Line {line_no} (ID: {rec_id}): 'prompt' must be a substantive string")

            ans = record.get("expected_answer")
            if not isinstance(ans, str) or len(ans.strip()) < 10:
                errors.append(f"Line {line_no} (ID: {rec_id}): 'expected_answer' must be a substantive string")

            crit = record.get("grading_criteria")
            if not isinstance(crit, list) or len(crit) == 0:
                errors.append(f"Line {line_no} (ID: {rec_id}): 'grading_criteria' must be a non-empty list of points")

    print(f"Total records processed: {total_records}")
    print(f"Unique IDs: {len(seen_ids)}")
    print(f"Validation errors: {len(errors)}")
    print(f"Grounding warnings: {len(warnings)}")

    if warnings:
        print("\n--- Grounding Warnings ---")
        for w in warnings:
            print(f"  [WARN] {w}")

    if errors:
        print("\n--- Validation Failures ---", file=sys.stderr)
        for e in errors:
            print(f"  [ERROR] {e}", file=sys.stderr)
        print("\n[RESULT] FAILED: Dataset contains schema or provenance violations.", file=sys.stderr)
        return False

    print("\n[RESULT] PASSED: All records adhere to strict schema, provenance, and validation constraints.")
    return True

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    workspace_dir = os.path.abspath(os.path.join(script_dir, "..", ".."))
    default_dataset = os.path.join(workspace_dir, "A6", "data", "evaluation-dataset.jsonl")

    target_file = sys.argv[1] if len(sys.argv) > 1 else default_dataset
    success = validate_dataset(target_file, workspace_dir)
    sys.exit(0 if success else 1)
