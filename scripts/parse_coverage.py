#!/usr/bin/env python3
"""
Parse coverage XML and check against threshold.
Used by GitHub Actions CI/CD pipeline.
"""

import xml.etree.ElementTree as ET
import sys

def main():
    try:
        # Parse the coverage XML file
        tree = ET.parse('cov/coverage.xml')
        root = tree.getroot()
        
        # Get the line rate
        rate = float(root.attrib.get('line-rate', '0'))
        threshold = 0.80
        
        print(f"backend coverage {rate:.2%} threshold {threshold:.0%}")
        
        # Exit with appropriate code
        if rate >= threshold:
            sys.exit(0)
        else:
            sys.exit(1)
            
    except FileNotFoundError:
        print("Coverage file not found")
        sys.exit(1)
    except Exception as e:
        print(f"Error parsing coverage: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
