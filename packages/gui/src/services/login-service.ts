import Keycloak, { KeycloakError, KeycloakInstance } from 'keycloak-js';
import m, { FactoryComponent } from 'mithril';
import { EmailInput, FlatButton, Options, TextInput } from 'mithril-materialized';
import { CircularSpinner } from '../components/ui/preloader';
import { Roles } from '../models/roles';
import { envSvc } from './env-service';

const tokenKey = 'token';
const refreshTokenKey = 'refresh-token';

const authErrorHandler = (error: KeycloakError) => {
  console.warn('Failed login via Keycloak');
  alert('Failed to initialize: ' + error);
};

const authSuccessHandler = (authenticated: boolean) => {
  Auth.setAuthenticated(authenticated);
  if (!authenticated || !Auth.refreshTokens()) {
    Auth.logout();
  }
  m.redraw();
};

export const Auth = {
  keycloak: {} as KeycloakInstance,
  isAuthenticated: false,
  name: '',
  username: '',
  email: '',
  token: window.localStorage.getItem(tokenKey) || '',
  refreshToken: window.localStorage.getItem(refreshTokenKey) || '',
  roles: [] as string[],
  clientId: '',

  async init() {
    // if (Auth.keycloak.login) {
    //   return;
    // }
    const env = await envSvc.getEnv();
    Auth.clientId = env.LOKI_CLIENTID;
    Auth.keycloak = Keycloak({
      realm: env.LOKI_REALM,
      url: `${env.LOKI_KEYCLOAK}/auth`,
      clientId: env.LOKI_CLIENTID,
    });
  },
  isLoggedIn() {
    return Auth.token && Auth.refreshToken;
  },
  refreshTokens() {
    const { token, refreshToken, tokenParsed } = Auth.keycloak;
    if (token && refreshToken && tokenParsed) {
      window.localStorage.setItem(tokenKey, token);
      window.localStorage.setItem(refreshTokenKey, refreshToken);
      Auth.setUsername((tokenParsed as any).preferred_username || '');
      Auth.setName((tokenParsed as any).name || '');
      Auth.setEmail((tokenParsed as any).email || '');
      if (tokenParsed.realm_access) {
        const roles = tokenParsed.realm_access.roles;
        if (
          tokenParsed.resource_access &&
          (tokenParsed.resource_access as any)[Auth.clientId] &&
          (tokenParsed.resource_access as any)[Auth.clientId].roles
        ) {
          roles.push(...(tokenParsed.resource_access as any)[Auth.clientId].roles);
        }
        Auth.setRoles(roles);
      }
      return true;
    }
    return false;
  },
  /** Can edit all documents, (un-)publish them, but also change the persons that have access. */
  isAdmin() {
    return Auth.roles.indexOf(Roles.ADMIN) >= 0;
  },
  /** Can edit all documents, (un-)publish them. */
  isEditor() {
    return Auth.roles.indexOf(Roles.EDITOR) >= 0;
  },
  /** Can edit the document, but also change the persons that have access. */
  canCRUD() {
    return Auth.isAuthenticated && Auth.isAdmin();
  },
  /** Can edit the document and publish it. */
  canEdit() {
    return Auth.isAuthenticated && (Auth.canCRUD() || Auth.isEditor());
  },
  setUsername(username: string) {
    Auth.username = username;
  },
  setName(name: string) {
    Auth.name = name;
  },
  setEmail(email: string) {
    Auth.email = email;
  },
  setRoles(roles: string[]) {
    Auth.roles = roles;
  },
  /** Match a role with one of the user's role. Returns true when a match is found. */
  matchRoles(roles: string[]) {
    return (Auth.roles || []).some(r => roles.indexOf(r) >= 0);
  }
  setAuthenticated(authN: boolean) {
    Auth.isAuthenticated = authN;
  },
  cleanTokens() {
    window.localStorage.removeItem(tokenKey);
    window.localStorage.removeItem(refreshTokenKey);
  },
  async refreshLogin() {
    if (Auth.isLoggedIn()) {
      await Auth.init();
      Auth.cleanTokens();
      Auth.keycloak
        .init({
          onLoad: 'check-sso',
          token: Auth.token,
          refreshToken: Auth.refreshToken,
          checkLoginIframe: false,
          // promiseType: 'native',
        })
        .success((authenticated: boolean) => {
          authSuccessHandler(authenticated);
        })
        .error(authErrorHandler);
    }
  },
  async login() {
    if (Auth.isAuthenticated) {
      return;
    }
    await Auth.init();
    Auth.keycloak
      .init({
        onLoad: 'login-required',
        redirectUri: window.location.href.replace('?', '') + '?',
        // promiseType: 'native',
      })
      .success((authenticated: boolean) => {
        authSuccessHandler(authenticated);
      })
      .error(authErrorHandler);
  },
  logout() {
    Auth.cleanTokens();
    Auth.setAuthenticated(false);
    Auth.setUsername('');
    Auth.setName('');
    Auth.setEmail('');
    Auth.setRoles([]);
    Auth.keycloak.logout();
    m.route.set('/');
  },
};

(window as any).Auth = Auth;

export const Login: FactoryComponent = () => {
  return {
    oncreate: async () => {
      await Auth.login();
    },
    view: () => {
      return m(
        '.row',
        { style: 'margin-top: 10px;' },
        Auth.isAuthenticated
          ? [
              m(
                '.col.s12',
                m(TextInput, { label: 'Username', disabled: true, initialValue: Auth.username, iconName: 'person' })
              ),
              m(
                '.col.s12',
                m(EmailInput, { label: 'email', disabled: true, initialValue: Auth.email, iconName: 'email' })
              ),
              m(
                '.col.s12',
                m(Options, {
                  label: 'Roles',
                  disabled: true,
                  options: [
                    { id: Roles.ADMIN, label: 'Administrator' },
                    { id: Roles.EDITOR, label: 'Editor' },
                  ],
                  checkedId: Auth.roles,
                  inline: true,
                })
              ),
              m(
                '.col.s12',
                m(FlatButton, {
                  label: 'Logout',
                  iconName: 'exit_to_app',
                  onclick: (e: any) => {
                    Auth.logout();
                    e.redraw = false;
                  },
                })
              ),
            ]
          : m(CircularSpinner, { className: 'center-align', style: 'margin-top: 20%;' })
      );
    },
  };
};
