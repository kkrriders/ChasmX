# app/schemas/models.py
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""

class UserLogin(BaseModel):
    email: EmailStr
    password: str


