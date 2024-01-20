"""Script to generate the generated-schemas.js source file."""
import json
import os
import sys


def main(path_to_schema_json_files, main_id=None):
    """Generates the generated-schemas.js.

    If main_id is None, then all *.schema.json files in the specified folder
    will be included. Otherwise, main_id and the schemas it references will be
    included.
    """
    schemas = {}
    for schema_id in os.listdir(path_to_schema_json_files):
        if not schema_id.endswith(".schema.json"):
            continue
        fn = os.path.join(path_to_schema_json_files, schema_id)
        with open(fn, "r", encoding="utf-8") as fin:
            schema = json.loads(fin.read())
        schema_id = schema.get("$id")
        if schema_id:
            schemas[schema_id] = schema
    assert schemas, "expected to find at least one schema file with a $id"
    script_dir = os.path.dirname(__file__)
    output_fn = os.path.join(script_dir, "../src/generated-schemas.js")

    if not main_id:
        key_schemas = schemas
    else:
        ids_to_process = [main_id]
        seen = set(ids_to_process)
        while ids_to_process:
            id_to_process = ids_to_process.pop(0)
            schema_to_crawl = schemas[id_to_process]
            referenced_ids = find_refs_in_schema(schema_to_crawl)
            for ref_id in referenced_ids:
                if ref_id not in seen:
                    seen.add(ref_id)
                    ids_to_process.append(ref_id)
        key_schemas = dict((k, schemas[k]) for k in seen)

    for schema in key_schemas.values():
        md5_version = schema.get("properties", {}).pop("md5", {}).get("const")
        if md5_version:
            schema["__md5_version"] = md5_version
    output_data = dict(
        schemas=key_schemas,
        main_schema_id=main_id)
    data_str = json.dumps(output_data, indent=2, sort_keys=True)
    with open(output_fn, "w", encoding="utf-8") as out:
        out.write(f"export const schemas = {data_str}")
    print(f'found {len(schemas)} schema{"" if len(schemas) == 1 else "s"}')
    if main_id:
        print(f'main = {main_id} includes {len(key_schemas)} total schemas:')
    for x in sorted(key_schemas.keys()):
        print(f'  {x}')


def find_refs_in_schema(x):
    ret = set()
    if not x:
        return ret
    if x.get("type") == "object" or x.get("properties"):
        for value_schema in (x.get("properties") or {}).values():
            ret |= find_refs_in_schema(value_schema)
        for value_schema in (x.get("patternProperties") or {}).values():
            ret |= find_refs_in_schema(value_schema)
        ret |= find_refs_from_if_then(x)
    elif x.get("type") == "array":
        ret |= find_refs_in_schema(x["items"])
    elif x.get("$ref"):
        ret.add(x.get("$ref"))
    return ret


def find_refs_from_if_then(x):
    ret = set()
    if not ret:
        return ret
    ret |= find_refs_in_schema(x.get("if"))
    ret |= find_refs_in_schema(x.get("then"))
    ret |= find_refs_from_if_then(x.get("else"))
    return ret


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
