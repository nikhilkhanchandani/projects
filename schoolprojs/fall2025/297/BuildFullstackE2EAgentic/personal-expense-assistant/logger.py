import json, sys
from datetime import datetime
def _emit(level: str, **fields):
    record = {"ts": datetime.utcnow().isoformat()+"Z", "level": level, **fields}
    print(json.dumps(record, ensure_ascii=False), file=sys.stdout if level!="error" else sys.stderr, flush=True)
def info(msg: str, **fields): _emit("info", msg=msg, **fields)
def warn(msg: str, **fields): _emit("warn", msg=msg, **fields)
def error(msg: str, **fields): _emit("error", msg=msg, **fields)
