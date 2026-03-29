import os
import threading
from datetime import datetime, timedelta, timezone
from typing import Optional, cast
from uuid import uuid4

import bcrypt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models.user import User

load_dotenv()

_secret_key = os.getenv("SECRET_KEY")
if not _secret_key or _secret_key == "your-secret-key" or len(_secret_key) < 32:
    raise RuntimeError(
        "SECRET_KEY ausente ou inseguro. Defina um SECRET_KEY forte no backend/.env (mínimo 32 caracteres)."
    )
SECRET_KEY: str = _secret_key

ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

# Estratégia simples de revogação em memória (single-instance).
# Em produção com múltiplas instâncias, migrar para Redis ou token versioning.
_revoked_tokens: set[str] = set()
_revoked_tokens_lock = threading.Lock()


def get_password_hash(password: str) -> str:
    """
    Gera hash bcrypt da senha.
    """
    password = str(password)[:72]  # limite do bcrypt
    password_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password_bytes, salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifica senha em texto puro contra hash bcrypt.
    """
    plain_bytes = str(plain_password).encode("utf-8")
    hashed_bytes = hashed_password.encode("utf-8")
    return bcrypt.checkpw(plain_bytes, hashed_bytes)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Cria JWT assinado com:
    - exp: expiração
    - iat: emissão
    - jti: identificador único do token (para revogação)
    """
    to_encode = data.copy()
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update(
        {
            "exp": expire,
            "iat": now,
            "jti": str(uuid4()),
        }
    )
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def revoke_token(token: str) -> None:
    """
    Revoga token atual adicionando à blacklist em memória.
    """
    with _revoked_tokens_lock:
        _revoked_tokens.add(token)


def is_token_revoked(token: str) -> bool:
    """
    Verifica se token foi revogado.
    """
    with _revoked_tokens_lock:
        return token in _revoked_tokens


def get_db():
    """
    Dependency de sessão do banco.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def authenticate_user(db: Session, email: str, password: str):
    """
    Autentica usuário por email/senha.
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return False
    if not verify_password(password, cast(str, user.hashed_password)):
        return False
    return user


def get_current_user(
    token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)
):
    """
    Resolve usuário atual a partir do JWT Bearer.
    Também bloqueia tokens revogados.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if is_token_revoked(token):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has been revoked",
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception

    return user
