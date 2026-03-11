(function () {
  var STORAGE_KEY = 'autosManoloSession';
  var AUTH_CLAIM = 'auth';
  var currentSession = null;

  function decodeBase64Url(value) {
    var normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4 !== 0) {
      normalized += '=';
    }
    return atob(normalized);
  }

  function parseJwt(token) {
    if (!token) {
      return null;
    }

    try {
      var tokenParts = token.split('.');
      if (tokenParts.length < 2) {
        return null;
      }
      return JSON.parse(decodeBase64Url(tokenParts[1]));
    } catch (error) {
      return null;
    }
  }

  function extractAuthorities(account, jwtPayload) {
    if (account && Array.isArray(account.authorities)) {
      return account.authorities;
    }

    if (!jwtPayload || !jwtPayload[AUTH_CLAIM]) {
      return [];
    }

    return String(jwtPayload[AUTH_CLAIM])
      .split(' ')
      .filter(function (role) {
        return role;
      });
  }

  function clearSession() {
    currentSession = null;
    localStorage.removeItem(STORAGE_KEY);
  }

  function normalizeSession(session) {
    if (!session || !session.token) {
      return null;
    }

    var jwtPayload = parseJwt(session.token);
    if (!jwtPayload) {
      clearSession();
      return null;
    }

    if (jwtPayload.exp && Date.now() >= Number(jwtPayload.exp) * 1000) {
      clearSession();
      return null;
    }

    session.account = session.account || {
      login: jwtPayload.sub || '',
      email: jwtPayload.sub || '',
    };
    session.authorities = extractAuthorities(session.account, jwtPayload);
    session.expiresAt = jwtPayload.exp ? Number(jwtPayload.exp) * 1000 : null;
    return session;
  }

  function readStoredSession() {
    try {
      var storedValue = localStorage.getItem(STORAGE_KEY);
      if (!storedValue) {
        return null;
      }
      return normalizeSession(JSON.parse(storedValue));
    } catch (error) {
      clearSession();
      return null;
    }
  }

  function persistSession(session) {
    currentSession = normalizeSession(session);
    if (currentSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSession));
    }
    return currentSession;
  }

  function getSession() {
    if (!currentSession) {
      currentSession = readStoredSession();
    }
    return currentSession;
  }

  function getToken() {
    var session = getSession();
    return session ? session.token : null;
  }

  function isAuthenticated() {
    return !!getSession();
  }

  function hasAnyRole(roles) {
    var session = getSession();
    if (!session || !roles || roles.length === 0) {
      return false;
    }

    return roles.some(function (role) {
      return session.authorities.indexOf(role) !== -1;
    });
  }

  function canCreateAutos() {
    return hasAnyRole(['ROLE_EDITOR', 'ROLE_ADMIN']);
  }

  function isAdmin() {
    return hasAnyRole(['ROLE_ADMIN']);
  }

  function getDisplayName() {
    var session = getSession();
    if (!session || !session.account) {
      return '';
    }

    if (session.account.firstName) {
      return session.account.firstName;
    }

    return session.account.login || session.account.email || '';
  }

  async function fetchAccount(token) {
    var response = await fetch('/api/account', {
      headers: {
        Authorization: 'Bearer ' + token,
      },
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    return response.json();
  }

  async function login(credentials) {
    var authResponse = await fetch('/api/authenticate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: credentials.email,
        password: credentials.password,
        rememberMe: false,
      }),
    });

    if (!authResponse.ok) {
      throw new Error('HTTP ' + authResponse.status);
    }

    var authPayload = await authResponse.json();
    var account = await fetchAccount(authPayload.id_token);

    return persistSession({
      token: authPayload.id_token,
      account: account,
    });
  }

  async function register(payload) {
    var response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('HTTP ' + response.status);
    }

    return true;
  }

  function getCurrentPageName() {
    var path = window.location.pathname.split('/').pop();
    return path || 'index.html';
  }

  function buildLoginUrl(returnTo) {
    return 'login.html?returnTo=' + encodeURIComponent(returnTo || getCurrentPageName());
  }

  function redirectToLogin(returnTo) {
    window.location.href = buildLoginUrl(returnTo);
  }

  function ensureAccess(roles) {
    if (!isAuthenticated()) {
      redirectToLogin(getCurrentPageName());
      return false;
    }

    if (roles && roles.length > 0 && !hasAnyRole(roles)) {
      window.location.href = 'index.html';
      return false;
    }

    return true;
  }

  function logout() {
    clearSession();
  }

  window.Auth = {
    canCreateAutos: canCreateAutos,
    ensureAccess: ensureAccess,
    getCurrentPageName: getCurrentPageName,
    getDisplayName: getDisplayName,
    getSession: getSession,
    getToken: getToken,
    hasAnyRole: hasAnyRole,
    isAuthenticated: isAuthenticated,
    isAdmin: isAdmin,
    login: login,
    logout: logout,
    redirectToLogin: redirectToLogin,
    register: register,
  };
})();
