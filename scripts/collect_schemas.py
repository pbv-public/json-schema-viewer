import json
import os
import sys


def main(path_to_schema_json_files):
    schemas = {}
    for x in os.listdir(path_to_schema_json_files):
        if not x.endswith(".schema.json"):
            continue
        fn = os.path.join(path_to_schema_json_files, x)
        schema = json.loads(open(fn, 'r').read())
        schema_id = schema.get('$id')
        if schema_id:
            schemas[schema_id] = schema
    assert schemas, 'expected to find at least one schema file with a $id'
    script_dir = os.path.dirname(__file__)
    output_fn = os.path.join(script_dir, '../src/generated-schemas.js')
    output_data = dict(
        schemas=schemas,
        key_schema_ids=[x for x in schemas.keys() if '/types' not in x]
    )
    data_str = json.dumps(output_data, indent=2, sort_keys=True)
    open(output_fn, 'w').write(f'export const schemas = {data_str}')
    print(f'found {len(schemas)} schema{"" if len(schemas) == 1 else "s"}')


if __name__ == '__main__':
    main(sys.argv[1])
