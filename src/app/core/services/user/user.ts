export class User {
  FirstName: string = '';
  LastName: string = '';
  Username: string = '';
  Password: string = '';
  InvestorType: string = '';
  Email: string = '';
  IsPolicyAccepted: string = '';
  Token: string = '';
  Company: string = '';
}
export class UserPass {

  FirstName: string = '';
  LastName: string = '';
  Username: string = '';
  Password: string = '';
  InvestorType: string = '';
  Email: string = '';
  IsPolicyAccepted: string = '';
  Token: string = '';
  Company: string = '';
}

export class UserView {
  firstName: string = '';
  lastName: string = '';
  username: string = '';
  investorType: string = '';
  isEmailVerified: string = '';
  viewHelp: string = '';
  token: string = '';
}



export class UserTrack {
  TrackingId: number = 0;
  Userid: number = 0;
  RequestedUrl: string = '';
  LogInTime: any = new Date();
  LogOutTime: any = new Date();
  RememberToken: string = '';
  IPAddress: string = '';
  Status: string = '';
}

export class UserTrackDtls {
  TrackingId: number = 0;
  Userid: number = 0;
  UserAgent: string = '';
  OS: string = '';
  browser: string = '';
  device: string = '';
  OSVersion: string = '';
  browserVersion: string = '';
  IsMobile: number = 0;
  IsTablet: number = 0;
  IsDesktopDevice: number = 0;
  ScreenPixelsHeight: number = 0;
  ScreenPixelsWidth: number = 0;
  touchScreen: boolean=false;
}


export class UserSettings {
  userId: string = '';
  showUserPortfolio: string = '';
  presentMode: string = '';
  dataMode: string = '';
  apperanceMode: string = "";
  paletteMode: string = "";
  rightGridOn: string = "";
  leftGridOn: string = "";
  defAccountValue: number = 0;
  fontSize: number = 0;
}


export class UserPermisions {
  stockPrice: boolean=false;
  userPortfolio: boolean = false;
  globalUniverse: boolean = false;
  showIndexStatistics: boolean = false;
  showImpRev: boolean = false;

}
