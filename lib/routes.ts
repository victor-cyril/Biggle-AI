const pf = (...args: string[]) => {
  const name = args.length > 0 ? args.join("/") : "";
  return `/${name}`;
};

export class Routes {
  static home = "/home";

  static auth = {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    error: "/auth/error",
    resetPassword: "/auth/reset-password",
  };

  static chat = {
    base: pf("chat"),
  };

  static billing = {
    base: pf("billing"),
  };

  static settings = {
    base: pf("settings"),
  };
}

export const apiLinks = {
  authPrefix: "/api/auth",
};

export const authRoutes = [
  Routes.auth.signIn,
  Routes.auth.signUp,
  Routes.auth.error,
  Routes.auth.resetPassword,
];

export const accessibleRoutes = [...authRoutes];

export const DEFAULT_LOGIN_REDIRECT = Routes.home;
export const DEFAULT_REGISTER_REDIRECT = Routes.home;

export const checkIsPublicRoute = (pathname: string) => {
  const excludedHomeRoutes = accessibleRoutes.filter((r) => r !== "/");
  return excludedHomeRoutes.includes(pathname) && pathname !== "/";
};
