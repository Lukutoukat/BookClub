python3 - <<'PY'
from pathlib import Path

for name in (
    "bookclub-backend/__tests__/bookclubmembertests.test.ts",
    "bookclub-backend/__tests__/propose.test.ts",
):
    path = Path(name)
    path.write_text(path.read_text().rstrip() + "\n")
PY
