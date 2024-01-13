import json
import os
import sys


def main(path_to_schema_json_files, prefixes_to_ignore):
    schemas = {}
    for schema_id in os.listdir(path_to_schema_json_files):
        if not schema_id.endswith(".schema.json"):
            continue
        fn = os.path.join(path_to_schema_json_files, schema_id)
        schema = json.loads(open(fn, "r").read())
        schema_id = schema.get("$id")
        if schema_id:
            schemas[schema_id] = schema
    assert schemas, "expected to find at least one schema file with a $id"
    script_dir = os.path.dirname(__file__)
    output_fn = os.path.join(script_dir, "../src/generated-schemas.js")
    key_schema_ids = []
    for schema_id in schemas:
        ok = True
        for prefix_to_ignore in prefixes_to_ignore:
            if schema_id.startswith(prefix_to_ignore):
                ok = False
                break
        if ok:
            key_schema_ids.append(schema_id)
    output_data = dict(schemas=schemas, key_schema_ids=key_schema_ids)
    data_str = json.dumps(output_data, indent=2, sort_keys=True)
    open(output_fn, "w").write(f"export const schemas = {data_str}")
    print(f'found {len(schemas)} schema{"" if len(schemas) == 1 else "s"}')


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2].split(",") if len(sys.argv) > 2 else [])
