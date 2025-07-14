import { Injectable } from '@angular/core';
import { User, UserSettings, UserView } from './user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from '../../authentication/authentication.service';
import { environment } from '../../../../environments/environment';
import { first } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private api_url = environment.api_url;
  currentUser: UserView = new UserView;
  constructor(private http: HttpClient, private authenticationService: AuthenticationService) {
    try { this.currentUser = this.authenticationService.currentUserValue; } catch (e) { }
   }

  ForgotPass(contact: any) {
    let users: User = {
      FirstName: "",
      LastName: contact.LastName,
      Username: contact.Email,
      Company: "",
      Password: "",
      InvestorType: "",
      Email: contact.Email,
      IsPolicyAccepted: 'Y',
      Token: ""
    }
    return this.http.post<string>(this.api_url + `/Users/ForgotPassword`, users);
  }

  verifyEmail(email: string, Id: string, code: string) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.post<string>(this.api_url + `/users/EmailVerify/` + email + `/` + Id + `/` + code + ``, httpOptions);
  }
  updateUserSettings(user: UserSettings) {
    return this.http.post(this.api_url + `/users/UpdateUserSettings`, user);
  }
  UpdatePassword(pass: string,oldpass: string) {
    // console.log(this.currentUser.username);
    var user = {
      Username: atob(atob(atob(JSON.parse(sessionStorage['currentUser']).username))),
      Password: pass,
      ExPassword: oldpass
    }
    return this.http.put(this.api_url + `/users/UpdatePassword`, user);
  }
  activePass(data: any) {
    return this.http.post(this.api_url + `/users/UpdatePasswordById`, data);
  }
  getUserSettings(id: any) {
    const httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
    return this.http.get(this.api_url + `/users/GetUserSettings/` + id, httpOptions);
  }

  ResetPass(pass: string, id: string, Code: string, email: string) {
    var user = { Username: email, Password: pass };
    return this.http.post<string>(this.api_url + `/users/VerifyForgotPass/${id}/${Code}`, user);
  }

  VerifyLinkFP(userid: any, code:any) {
    var data = { userid: userid, code: code };
    return this.http.post(this.api_url + `/Users/VerifyLinkFP`, data);
  }

}
