import asyncio
from auth import verify_password, get_password_hash

pwd = "admin"
hashed = get_password_hash(pwd)
res = verify_password(pwd, hashed)
print(f"Result: {res}")
