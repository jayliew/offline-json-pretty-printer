import pprint
from ast import literal_eval
import re
import sys
import argparse

# USAGE:
# python script.py "Car(make=CarMake(name='Toyota 🚗', country='Japan'), model='Camry', year=2025)" -o output.txt

# Add helper classes for arbitrary class calls
class DefaultFunction:
    def __init__(self, name):
        self.name = name
    def __call__(self, *args, **kwargs):
        return (self.name, args, kwargs)

class SafeDict(dict):
    def __missing__(self, key):
        return DefaultFunction(key)

class CustomPrettyPrinter(pprint.PrettyPrinter):
    def format(self, obj, context, maxlevels, level):
        if isinstance(obj, str) and obj.startswith(('node(', 'Bird(')):
            return obj, True, False
        return pprint.PrettyPrinter.format(self, obj, context, maxlevels, level)

def custom_pprint(obj):
    pp = CustomPrettyPrinter(indent=2, width=80)
    # Instead of directly printing, return the formatted string
    return pp.pformat(obj)

def escape_newlines_in_literals(s):
    def replacer(match):
        literal = match.group(0)
        return literal.replace("\n", "\\n")
    return re.sub(r"'(?:\\'|[^'])*'", replacer, s)

def process_serialized_data(serialized_data, output_file=None):
    # Preprocess to escape newlines inside single-quoted literals
    safe_serialized_data = escape_newlines_in_literals(serialized_data)
    
    # Use eval with a safe globals dictionary to handle arbitrary class names
    deserialized_data = eval(safe_serialized_data, {"__builtins__": {}}, SafeDict())
    
    # Get the formatted output as a string
    output = custom_pprint(deserialized_data)
    
    # If output_file is specified, write to it; otherwise return the string
    if output_file:
        with open(output_file, 'w') as f:
            f.write(output)
    return output

def main():
    # Set up argument parser
    parser = argparse.ArgumentParser(description='Process serialized Python data and pretty print it')
    parser.add_argument('input_string', help='Serialized Python data structure')
    parser.add_argument('-o', '--output', help='Output file path (optional)')
    
    # Parse arguments
    args = parser.parse_args()
    
    # Process the input and handle the output
    result = process_serialized_data(args.input_string, args.output)
    
    # If no output file specified, print to stdout
    if not args.output:
        print(result)

if __name__ == "__main__":
    main()