import { AfterViewInit, Component ,OnInit} from '@angular/core';
import { SharedDataService } from '../../core/services/sharedData/shared-data.service';
declare var $: any;
@Component({
  selector: 'app-not-found-page',
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss'
})
export class NotFoundPageComponent implements OnInit,AfterViewInit {
  constructor(public sharedData: SharedDataService) { }

  ngAfterViewInit() {
    var setDarkLocalstorage = localStorage.getItem('darkmode');
    if (setDarkLocalstorage == 'true') { this.darkModeTheme('dark'); }
    else { this.darkModeTheme('dark'); }
  }
  ngOnInit() {
    var that = this;
    try { that.sharedData.showCircleLoader.next(false); } catch (e) { }
    that.sharedData.showCircleLoader.next(false); 
    that.sharedData.showSideNavBar.next(false);
  } 
  darkModeTheme(tema: string) {
    var $body = $('body');
    var $html = $('html');
    if (tema == 'light') {
      $body.removeClass('dark');
      $html.removeClass('dark');
      localStorage.setItem('darkmode', 'false');
    }
    else {
      localStorage.setItem('darkmode', 'true');
      $body.addClass('dark show-h-f');
      $html.addClass('dark');
    }
  }

}
