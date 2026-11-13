import sys, re, glob
files = sys.argv[1:] or sorted(glob.glob('chapters/*.md'))
total = 0
for f in files:
    t = open(f, encoding='utf-8').read()
    body = "\n".join(l for l in t.splitlines() if not l.startswith('#'))
    body = body.strip()
    n = len(body)
    ns = len(body.replace(' ', '').replace('\n', ''))
    total += n
    flag = 'OK' if 5100 <= n <= 6800 else ('SHORT' if n < 5100 else 'LONG')
    print(f"{f}: {n} chars (with spaces), {ns} (no spaces) -> {flag}")
print("TOTAL:", total)
