export const environment = {
    version: '202304100.0.24',
production: true,
api_url: 'https://api.dev.space.int.kube.buildyourindex.com/api',
demoapi_url: 'https://api.dev.space.int.kube.buildyourindex.com/api',
ibkrcpapi_url: 'https://api.dev.space.int.kube.buildyourindex.com/api',
prod_Url: 'https://www.newagealpha.com/',
demo_Url: 'https://demo-alpha7.newagealpha.com/',
dllApiService: false,
dllApi_url: `https://api.dev.space.int.kube.buildyourindex.com/api`,
trackApi_url: 'https://trackapi.newagealpha.com/api',
appName: 'SPACE Tool',
pkyrs: '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDrpv5L3hWxwfy5gvEi6Y40iv8FrMqoCr63NaXLLZOeU38Vew4Pwl+bLKDz1OvyN0Z7WRzr4GmRttpmqqlFnDooqysWBhaBtwojYMdGs/cbtv/k7ubhFOSrQoXsuzRsIR2tcerH5ZrFSUBrXt25MxwVXsqJ5Fxxs67eXISZw+nZKQIDAQAB-----END PUBLIC KEY-----',

oidc: {
  clientId: `0oa8s68xfamcXycIq5d7`,
  issuer: `https://dev-49166513.okta.com/oauth2/default`,
  redirectUri: '/callback',
  scopes: ['openid', 'profile', 'email'],
  pkce: true,
  testing: {
    disableHttpsCheck: true
  }
}
};
