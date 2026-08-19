const AUTH_SESSION_COOKIE = /^(?:__Secure-)?authjs\.session-token(?:\.\d+)?=/;

function isSessionCreationCookie(cookie: string): boolean {
  if (!AUTH_SESSION_COOKIE.test(cookie)) return false;

  const separatorIndex = cookie.indexOf(";");
  const nameAndValue = separatorIndex === -1 ? cookie : cookie.slice(0, separatorIndex);
  const valueIndex = nameAndValue.indexOf("=");
  return valueIndex !== -1 && nameAndValue.slice(valueIndex + 1).length > 0;
}

/**
 * Auth.js issues persistent session-token cookies by default. Removing their
 * browser expiry turns them into session cookies, while leaving deletion
 * cookies untouched so explicit sign-out continues to work.
 */
export function makeBrowserSessionCookie(response: Response): Response {
  const setCookies = response.headers.getSetCookie();
  if (!setCookies.some(isSessionCreationCookie)) return response;

  response.headers.delete("set-cookie");
  for (const cookie of setCookies) {
    const browserSessionCookie = isSessionCreationCookie(cookie)
      ? cookie
          .replace(/;\s*Expires=[^;]*/gi, "")
          .replace(/;\s*Max-Age=[^;]*/gi, "")
      : cookie;
    response.headers.append("set-cookie", browserSessionCookie);
  }

  return response;
}
