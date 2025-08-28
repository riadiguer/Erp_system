from datetime import datetime, timedelta, timezone

def set_cookie(response, name, value, *, max_age=None, expires=None, secure=False, samesite="Lax"):
    response.set_cookie(
        key=name,
        value=value,
        httponly=True,
        secure=secure,
        samesite=samesite,
        max_age=max_age,
        expires=expires,
        path="/",
    )

def clear_cookie(response, name):
    response.delete_cookie(name, path="/")

def attach_token_cookies(response, access_token, refresh_token=None):
    # Access: short lived
    set_cookie(
        response,
        "access",
        access_token,
        max_age=15 * 60,  # keep in sync with SIMPLE_JWT.ACCESS_TOKEN_LIFETIME
        secure=False,     # True in prod
        samesite="Lax",
    )
    if refresh_token:
        set_cookie(
            response,
            "refresh",
            refresh_token,
            max_age=7 * 24 * 3600,
            secure=False,  # True in prod
            samesite="Lax",
        )

def clear_tokens(response):
    clear_cookie(response, "access")
    clear_cookie(response, "refresh")
