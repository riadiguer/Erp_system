from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import Group
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import MeSerializer, AdminCreateUserSerializer
from .utils import attach_token_cookies, clear_tokens
from .auth import CookieJWTAuthentication
from .permissions import IsAdminUserStrict

User = get_user_model()

class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        username = request.data.get("username")
        email = request.data.get("email")
        password = request.data.get("password")

        # Allow login by username OR email
        user = None
        if username:
            user = authenticate(request, username=username, password=password)
        elif email:
            try:
                u = User.objects.get(email=email)
                user = authenticate(request, username=u.username, password=password)
            except User.DoesNotExist:
                user = None

        if not user:
            return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)
        access = refresh.access_token

        res = Response({"ok": True})
        attach_token_cookies(res, str(access), str(refresh))
        return res

class RefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token = request.COOKIES.get("refresh")
        if not token:
            return Response({"detail": "No refresh token"}, status=status.HTTP_401_UNAUTHORIZED)
        try:
            refresh = RefreshToken(token)
            access = str(refresh.access_token)
            res = Response({"ok": True})
            # issue only a new access here (keep refresh stable)
            attach_token_cookies(res, access_token=access)
            return res
        except Exception:
            return Response({"detail": "Invalid refresh token"}, status=status.HTTP_401_UNAUTHORIZED)

class LogoutView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        res = Response({"ok": True})
        clear_tokens(res)
        return res

class MeView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(MeSerializer(request.user).data)

class AdminCreateUserView(APIView):
    authentication_classes = [CookieJWTAuthentication]
    permission_classes = [IsAdminUserStrict]

    def post(self, request):
        serializer = AdminCreateUserSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"ok": True, "id": user.id}, status=status.HTTP_201_CREATED)
