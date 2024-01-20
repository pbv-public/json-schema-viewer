"""Script to generate the generated-schemas.js source file."""
import json
import os
import sys


def main(path_to_schema_json_files, prefixes_to_include=None, main_id=None):
    """Generates the generated-schemas.js.

    Includes all *.schema.json files in the specified folder. If
    prefixes_to_include is provided, then only files whose $id matches at least
    one of these prefixes will be included.
    """
    schemas = {}
    for schema_id in os.listdir(path_to_schema_json_files):
        if not schema_id.endswith(".schema.json"):
            continue
        fn = os.path.join(path_to_schema_json_files, schema_id)
        with open(fn, "r", encoding='utf-8') as fin:
            schema = json.loads(fin.read())
        schema_id = schema.get("$id")
        if schema_id:
            schemas[schema_id] = schema
    assert schemas, "expected to find at least one schema file with a $id"
    script_dir = os.path.dirname(__file__)
    output_fn = os.path.join(script_dir, "../src/generated-schemas.js")
    key_schemas = {}
    for schema_id, schema in schemas.items():
        ok = False
        if not prefixes_to_include:
            ok = True
        else:
            for prefix_to_include in prefixes_to_include:
                if schema_id.startswith(prefix_to_include):
                    ok = True
                    break
        if ok:
            key_schemas[schema_id] = schema
            md5_version = schema.get('properties', {}).pop('md5', {}).get('const')
            if md5_version:
                schema['__md5_version'] = md5_version
    output_data = dict(
        schemas=key_schemas,
        main_schema_id=main_id)
    data_str = json.dumps(output_data, indent=2, sort_keys=True)
    with open(output_fn, "w", encoding='utf-8') as out:
        out.write(f"export const schemas = {data_str}")
    print(f'found {len(schemas)} schema{"" if len(schemas) == 1 else "s"}')


if __name__ == "__main__":
    main(
        sys.argv[1],
        sys.argv[2].split(",") if len(sys.argv) > 2 else [],
        sys.argv[3] if len(sys.argv) > 3 else None)
