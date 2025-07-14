import { AfterViewInit, Component ,OnInit} from '@angular/core';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';
import { Router } from '@angular/router';
import { Idle } from '@ng-idle/core';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { MatDialog } from '@angular/material/dialog';
declare var $: any;
@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrl: './logout.component.scss'
})
export class logoutComponent implements OnInit,AfterViewInit {
  constructor(public sharedData: SharedDataService, private router: Router, private idle: Idle,
    private authenticationService: AuthenticationService, private dialogRef: MatDialog,) { }

  ngAfterViewInit() { };

  ngOnInit() {
    var that = this;
    this.authenticationService.authState.next(false);
    this.sharedData.showSideNavBar.next(false);
    this.authenticationService.resetService();
    this.sharedData.showCircleLoader.next(false);
    try { this.dialogRef.closeAll(); } catch (e) { }
    try { setTimeout(() => { $('.modal').modal('hide'); }, 2000); } catch (e) { }
    try { setTimeout(() => { $('#sessionOutPop').modal('hide'); }, 1000); } catch (e) { }
    try { this.idle.stop(); } catch (e) { }
    try { sessionStorage.removeItem('currentUser'); } catch (e) { }
    try { sessionStorage.removeItem('issuer'); } catch (e) { }
    try { sessionStorage.removeItem('trackingId'); } catch (e) { }
    try {
      if (sessionStorage.getItem('rToken') === null && sessionStorage.getItem('rToken') === "") {
        sessionStorage.removeItem('rToken');
      };
    } catch (e) { }
  }

  async logOut() { this.router.navigate(['/login']) }

}
