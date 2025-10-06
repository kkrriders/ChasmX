import re

def validate_password_strength(password: str) -> bool:
    # Minimum 8 chars, at least one number, one uppercase, one special char
    pattern = re.compile(r'^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$')
    return bool(pattern.match(password))
