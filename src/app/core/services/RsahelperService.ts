import { Injectable } from '@angular/core';
import * as forge from 'node-forge';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class RsahelperService {

  private rspky: string = environment.pkyrs;

  constructor() { }

  public encrypt(val:any) {
    var rsa = forge.pki.publicKeyFromPem(this.rspky);
    var encryptedval = window.btoa(rsa.encrypt(val));
    var payload = encryptedval;
    return encryptedval;
  }

}
