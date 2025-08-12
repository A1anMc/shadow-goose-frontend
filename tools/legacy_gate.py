import os, sys, re, glob

def fail(msg):
    print(f"[LEGACY-GATE] {msg}")
    sys.exit(1)

# 1) No commented-out code blocks lingering
for path in glob.glob("**/*.py", recursive=True):
    with open(path, "r", encoding="utf-8") as f:
        txt = f.read()
    if re.search(r"(?m)^\s*#\s*TODO\s*:\s*remove after fix", txt):
        fail(f"Remove legacy TODO in {path}")

# 2) Require migration notes when models changed
schema_touch = any(p.startswith("app/models/") for p in sys.argv[1:])
if schema_touch:
    if not os.path.exists("app/migrations"):
        fail("Models changed but no migrations folder exists")
    if not any(name.endswith(".py") for name in os.listdir("app/migrations")):
        fail("Models changed but no new migration detected")

print("[LEGACY-GATE] clean")
