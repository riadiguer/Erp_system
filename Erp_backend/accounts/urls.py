from django.urls import path
from .views import LoginView, RefreshView, LogoutView, MeView, AdminCreateUserView

urlpatterns = [
    path("auth/token/", LoginView.as_view(), name="login"),
    path("auth/refresh/", RefreshView.as_view(), name="token_refresh"),
    path("auth/logout/", LogoutView.as_view(), name="logout"),
    path("auth/me/", MeView.as_view(), name="me"),
    path("admin/users/", AdminCreateUserView.as_view(), name="admin_create_user"),
]
