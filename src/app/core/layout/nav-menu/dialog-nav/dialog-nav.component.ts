import { Component, Inject, OnDestroy, OnInit, ViewEncapsulation, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UserSettings, UserView } from '../../../services/user/user';
import { UserService } from '../../../services/user/user.service';
import { Subscription, first } from 'rxjs';
import { isNotNullOrUndefined, SharedDataService } from '../../../services/sharedData/shared-data.service';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../../../services/data/data.service';
// @ts-ignore
declare var $;
@Component({
  selector: 'app-dialog-nav',
  templateUrl: './dialog-nav.component.html',
  styleUrl: './dialog-nav.component.scss',
  encapsulation: ViewEncapsulation.None // Disable view encapsulation
})
export class DialogNavComponent implements OnInit, OnDestroy {
  dialogTitle: string = '';
  dialogData: any;
  app_slider_value: number = 16;
  fontSizeRem: string = this.pxToRem(this.app_slider_value) + 'rem';
  expandMore: boolean = false;
  showPresentMode: boolean = false;
  showUserPortfolio: boolean = false;
  isresetdisable: boolean = false;
  defAccountValue: any = "0";
  pSwitch: string = 'Off';
  gSwitch: string = 'Off';
  windowWidth: number = 0;
  Change_header_LD: string = "live";
  Change_header_Env: boolean = false; // Demo is false
  showLiveDemoToggle: boolean = false;
  isLoadedPPTSlides: boolean = false;
  selPrefer: string = 'General';
  constructor(public sharedData: SharedDataService, private userService: UserService, private dataService: DataService, private dialogref: MatDialogRef<DialogNavComponent>, @Inject(MAT_DIALOG_DATA) public modalData: any,private toastr: ToastrService) {
  }

  sortListData:any = [];
  watchSortListData:any = [];

  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  PPT_All_Data: any = [];
  SelectedPPTData: any;
  showSpinnerPPT_list: boolean = true;
  subscriptions = new Subscription();
  ngOnInit() {
    var that = this;
    this.dialogTitle = this.modalData.dialogTitle;
    this.dialogData = this.modalData.dialogData;
    if (this.dialogTitle != 'Select PPT Slides') {
      this.fillPreference();
      this.getWindowWidth();
    } else {
      /* PPT Slides */
      that.PPT_All_Data = this.sharedData._GetAllPresentationdata;
      if (that.PPT_All_Data.length > 0) {
        var filterSetDefault = [...that.PPT_All_Data].filter((x: any) => x.name == this.sharedData._GetDefaultPresentationdata[0].presentationName);
        if (isNotNullOrUndefined(filterSetDefault) &&  filterSetDefault.length > 0) {
          that.getIndividualPPTData(filterSetDefault[0]);
        } else {
          that.getIndividualPPTData(that.PPT_All_Data[0]);
        }
      }
    }

    var gsort = this.sharedData.getSortSettingData.subscribe((res: any) => { if (this.dialogTitle == 'Preferences') { this.loadSortOption(); } });
    this.subscriptions.add(gsort);
  }

  loadSortOption() {
    this.sortListData = [];
    this.watchSortListData = [];
    if (this.sharedData.checkShowLeftTab(2027) == 'A') {
      var equity: any = this.getSortObj('Equity', 'equity');  
      this.sortListData.push(equity);
    }

    if (this.sharedData.checkShowLeftTab(2028) == 'A') {
      var etf: any = this.getSortObj('ETF', 'etf');
      this.sortListData.push(etf);
    }

    if (this.sharedData.checkShowLeftTab(4) == 'A') {
      var prebuild: any = this.getSortObj('Prebuild', 'prebuild');
      this.sortListData.push(prebuild);        
    }

    if (this.sharedData.checkShowLeftTab(12) == 'A') {
      if (this.sharedData.checkMyUserType()) {
        var di: any = this.getSortObj('Approved', 'di');
        this.sortListData.push(di);
      } else {
        var di: any = this.getSortObj('Direct Index', 'di');
        this.sortListData.push(di);
      }          
    }

    if (this.sharedData.checkShowLeftTab(25) == 'A') {
      var thematic: any = this.getSortObj('Thematic', 'thematic');
      this.sortListData.push(thematic);
    }

    if (this.sharedData.checkShowLeftTab(2027) == 'A') {
      var timeLine: any = this.getSortObj('Timeline', 'timeline', false);
      this.sortListData.push(timeLine);
    }

    if (this.sharedData.checkShowLeftTab(2027) == 'A' || this.sharedData.checkShowLeftTab(2028) == 'A') {
      var hisTimeline: any = this.getSortObj('History Timeline', 'hisTimeline', false);
      this.sortListData.push(hisTimeline);

      var compare: any = this.getSortObj('Compare', 'compare', false);
      this.sortListData.push(compare);
    }

    if (this.sharedData.checkShowLeftTab(2028) == 'A') {
      var vs: any = this.getSortObj('VS Compare', 'vs', false);
      this.sortListData.push(vs);
    }

    if (this.sharedData.checkShowLeftTab(3) == 'A') {
      var ci: any = this.getSortObj('Custom Index', 'ci');
      this.sortListData.push(ci); 
    }

    if (this.sharedData.checkShowLeftTab(11) == 'A') {
      if (this.sharedData.checkShowLeftTab(2027) == 'A' && (this.sharedData.checkMenuPer(2027, 2234) == "Y" || this.sharedData.checkMenuPer(2027, 2234) == "D")) {
        var eq: any = this.getSortObjWatch('Equity', 'equity');
        this.watchSortListData.push(eq);
      }

      if (this.sharedData.checkShowLeftTab(2028) == 'A' && (this.sharedData.checkMenuPer(2028, 2250) == 'Y' || this.sharedData.checkMenuPer(2028, 2250) == 'D')) {
        var et: any = this.getSortObjWatch('ETF', 'etf');
        this.watchSortListData.push(et);
      }

      if (this.sharedData.checkShowLeftTab(2027) == 'A' && (this.sharedData.checkMenuPer(2027, 2234) == "Y" || this.sharedData.checkMenuPer(2027, 2234) == "D")) {
        var ind: any = this.getSortObjWatch('Indexes', 'prebuild');
        this.watchSortListData.push(ind);
      }
    }
  }
 
 
  getSortObjWatch(title: string, key: string) {
    var data: any = this.sharedData.getSortSettingData.value;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var left = [...data].filter((x: any) => x[key] == true && parseInt(x.userid) == parseInt(userid) && x.type == 'W');
    var defLetf = [...data].filter((x: any) => x[key] == true && parseInt(x.userid) == 0 && x.type == 'W');
    var Obj: any = {};
    Obj['title'] = title;
    if (left.length > 0) { 
      Obj['right'] = left[0]['name']; 
      Obj['sortR'] = left[0]['sortby'];
    } else if (defLetf.length > 0) {
       Obj['right'] = defLetf[0]['name']; 
       Obj['sortR'] = defLetf[0]['sortby'];
      } else { Obj['right'] = ''; Obj['sortR'] = '' };
    return Obj;
  }

  getSortObj(title: string, key: string, leftOP: boolean = true, rightOP: boolean = true) {
    var data: any = this.sharedData.getSortSettingData.value; 
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var left = [...data].filter((x: any) => x[key] == true && parseInt(x.userid) == parseInt(userid) && x.type == 'L'); 
    var defLetf = [...data].filter((x: any) => x[key] == true && parseInt(x.userid) == 0 && x.type == 'L');
    var right = [...data].filter((x: any) => x[key] == true && parseInt(x.userid) == parseInt(userid) && x.type == 'R');
    var defRight = [...data].filter((x: any) => x[key] == true && parseInt(x.userid) == 0 && x.type == 'R');
    var Obj: any = { };
    Obj['title'] = title;
    Obj['leftOP'] = leftOP;
    Obj['rightOP'] = rightOP;
    
    if (left.length > 0) {
       Obj['left'] = left[0]['name']; 
       Obj['sortL'] = left[0]['sortby'];
      } else if (defLetf.length > 0){
         Obj['left'] = defLetf[0]['name']; 
         Obj['sortL'] = defLetf[0]['sortby'] ;
        } else {
       Obj['left'] =''
       Obj['sortL'] =''
       };
    if (right.length > 0) {  
      Obj['right'] = right[0]['name']; 
      Obj['sortR'] =right[0]['sortby'];
    } else if (defRight.length > 0) { 
      Obj['right'] = defRight[0]['name']; 
      Obj['sortR'] = defRight[0]['sortby'];
    } else { Obj['right'] = '';Obj['sortR'] ='' };
    return Obj;
  }

  getIndividualPPTData(d: any) {
    var that = this;
    that.SelectedPPTData = d;
    that.isLoadedPPTSlides = false;
    that.showSpinnerPPT_list = true;
    var postData = { "pid": d.id }
    const bList = that.dataService.GetPresentationSlides(postData).pipe(first()).subscribe((slides: any) => {
      if (slides[0] != "Failed") {
       // console.log(slides);
        that.SlidesImagesList = slides;
        that.showSpinnerPPT_list = false;
        setTimeout(() => { that.isLoadedPPTSlides = true; }, 1000);
      }
    }, error => { this.isLoadedPPTSlides = false; that.showSpinnerPPT_list = false; });
  }
  setAsDefault() {
    var that = this;
    var postData = { "pid": that.SelectedPPTData.id };
    const bList = that.dataService.UpdateDefaultPresentationId(postData).pipe(first()).subscribe((slides: any) => {
      if (slides[0] != "Failed") {
        /** Reload once set default success **/
        that.toastr.success('Updated successfully', '', { timeOut: 5000 });
        var GetPresentationdata = this.dataService.GetPresentationdata().pipe(first()).subscribe((res: any) => {
          //console.log(res);
          that.sharedData.GetAllPresentationdata.next(res);
          that.PPT_All_Data = res;
        },
          (error: any) => {
            that.sharedData.GetAllPresentationdata.next([]);
          });
        /** Reload once set default success **/
      }
    }, error => { });
  }
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.getWindowWidth();
  }
  responsiveFont:boolean = true;
  getWindowWidth(): void {
    this.windowWidth = window.innerWidth;
    
    if(this.windowWidth > 1450){
      this.responsiveFont = true;
     }
     else{
      this.responsiveFont = false;
     }
  }
  closeModal() {
    this.dialogref.close();
  }

  pxToRem(px: number): number {
    // const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const rootFontSize = 16;
    // console.log(rootFontSize,'rootfon')
    // var roundoff = Math.round(px / rootFontSize) - 0.3
    // console.log(Math.round(px / rootFontSize) - 0.3,'font')
    // return Math.round(px / rootFontSize) - 0.3;
    return px / rootFontSize - 0.3;
  }
  updateSlider(ev:any, save: boolean = false) {
    var val: any = ev.target.value;
    this.fontSizeRem = this.pxToRem(this.app_slider_value) + 'rem';
    // console.log(this.fontSizeRem,val,'this.fontSizeRem')
    this.updateSli(val);
    //if (save) { this.updateUserSetting(); }
  }
  updateSli(val: number) {
    //var $body = $('body, html');
    this.app_slider_value = val;
    this.fontSizeRem = this.pxToRem(this.app_slider_value) + 'rem';
    //console.log(this.app_slider_value,'app_slider_value')
    //this.sharedData.getFontSettings.next(val);
    //if (val == 14) {
    //  $body.removeClass('fs--15');
    //  $body.removeClass('fs--16');
    //  $body.removeClass('fs--17');
    //  $body.removeClass('fs--18');
    //  $body.addClass('fs--14');
    //}
    //else if (val == 15) {
    //  $body.removeClass('fs--14');
    //  $body.removeClass('fs--16');
    //  $body.removeClass('fs--17');
    //  $body.removeClass('fs--18');
    //  $body.addClass('fs--15');
    //}
    //else if (val == 16) {
    //  $body.removeClass('fs--14');
    //  $body.removeClass('fs--15');
    //  $body.removeClass('fs--17');
    //  $body.removeClass('fs--18');
    //  $body.addClass('fs--16');
    //}
    //else if (val == 17) {
    //  $body.removeClass('fs--14');
    //  $body.removeClass('fs--15');
    //  $body.removeClass('fs--16');
    //  $body.removeClass('fs--18');
    //  $body.addClass('fs--17');
    //}
    //else {
    //  $body.removeClass('fs--14');
    //  $body.removeClass('fs--15');
    //  $body.removeClass('fs--16');
    //  $body.removeClass('fs--17');
    //  $body.addClass('fs--18');
    //}
  }
  pageloadTrigger: boolean = false;
  Change_header_Environment(x:string) {
    if (x == 'live') {
      this.Change_header_Env = true;
      //this.Change_header_LD = 'demo';
      //$(".livedemoDrop").removeClass("show");
    }
    else {
      this.Change_header_Env = false;
      //this.Change_header_LD = 'live';
      //$(".livedemoDrop").removeClass("show");
    }
    this.pageloadTrigger = true;
    this.savePreference();
  }
  fillPreference() {
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    var that = this;
    if (that.sharedData._getPresentationMode == 'Y') {
      that.showPresentMode = true;
      that.pSwitch = "On";
    } else {
      that.showPresentMode = false;
      that.pSwitch = "Off";
    }
    if (that.sharedData._getFontSettings == 0) {
      if (window.innerWidth <= 1600) { that.app_slider_value = 16; } else { that.app_slider_value = 17; }
    }
    else { that.app_slider_value = that.sharedData._getFontSettings; };
    that.setLayoutColor = that.sharedData._getThemeColorMode;
    localStorage.setItem('set-palette', that.setLayoutColor);
    that.updateSli(that.app_slider_value);
    that.userService.getUserSettings(userid).pipe(first()).subscribe((userdata: any) => {
      if (Object.keys(userdata).length > 0) {
        that.sharedData.userPrefData.next(userdata);
        that.assignPreferenceData(userdata[0]);
      }
    });
  }
  checkModeMsg(msg: any) { return msg.replaceAll('(MODE)', ((!this.Change_header_Env) ? 'Live' : 'Demo')); }
  assignPreferenceData(data:any) {
   
   
    if (isNotNullOrUndefined(data['dataMode']) && data['dataMode'] == "L") {
      //this.Change_header_LD = "live";
      this.Change_header_Env = true;
      //this.showLiveDemoToggle = true;
    } else {
      //this.Change_header_LD = "demo";
      this.Change_header_Env = false;
      //this.showLiveDemoToggle = false;
    }

    //if (isNullOrUndefined(data['fontSize'])) { this.app_slider_value = 16; }
    //else { this.app_slider_value = data['fontSize']; };
    
    
  }
  savePreference() {

    var that = this;
    let objdtls: UserSettings;
    objdtls = new UserSettings();
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    objdtls.userId = userid;
    if (that.showPresentMode == true) objdtls.presentMode = 'Y';
    else objdtls.presentMode = 'N';

    if (that.showUserPortfolio == true) objdtls.showUserPortfolio = 'Y';
    else objdtls.showUserPortfolio = 'N';

    if (that.Change_header_Env) objdtls.dataMode = 'L';
    else objdtls.dataMode = 'D';

    objdtls.defAccountValue = 0;
    objdtls.fontSize = this.app_slider_value;
    objdtls.apperanceMode = this.setLayoutColor;
    that.sharedData.getFontSettings.next(this.app_slider_value);
    that.sharedData.getThemeColorMode.next(this.setLayoutColor);
    that.sharedData.rouletCircleHomeRotate.next(true);
    that.sharedData.getPresentationMode.next(objdtls.presentMode);
    that.userService.updateUserSettings(objdtls).pipe(first()).subscribe(data => {
      that.toastr.success('Preference saved successfully', '', { timeOut: 5000 });
      this.closeModal();
      if (this.pageloadTrigger) { setTimeout(() => { window.location.reload(); }, 800); }
      
    }, error => { window.location.reload(); });
  }
  presentationMode(e: any) {
    //this.pre_mode = !this.pre_mode;
    let that = this;
    if (e.checked == true) {
      that.pSwitch = 'On';
      //$('body').addClass('P_mode');
      that.showPresentMode = true;
    }
    else {
      that.showPresentMode = false;
      that.pSwitch = 'Off';
      //$('body').removeClass('P_mode');
    }
  }
  setLayoutColor: string = "D";
  selectLayoutColor(val:string) {
    let that = this;
    that.setLayoutColor = val;
    localStorage.setItem('set-palette', val);
    $('body').removeClass('C_layout_1');
    $('body').removeClass('C_layout_2');
    $('body').removeClass('C_layout_3');
    $('body').removeClass('C_layout_4');
    
    if (val == 'D') {
      $('body').addClass('C_layout_1');
    }
    else if (val == 'B') {
      $('body').addClass('C_layout_2');
    }
    else if (val == 'C') {
      $('body').addClass('C_layout_3');
    }
    else {
      $('body').addClass('C_layout_4');
    }
  }
  SlidesImagesList: any = [];
  gridOptionsCheckbox: boolean = false;
  SlidesImagesText: string = 'PPT_Data';
  savePinnedStrategy(e: any) {
    //this.pre_mode = !this.pre_mode;
    var that = this;
    that.gridOptionsCheckbox = e.checked;
  }
  getPPTSlides(list:string) {
    var that = this;
    that.SlidesImagesText = list;
    if (list == 'PPT_Data') {
      that.SlidesImagesList = that.PPT_Data;
    } else {
      that.SlidesImagesList = that.PPT_Data_Dynamic;
    }
  }
  expandMorePPT() {
    this.expandMore = !this.expandMore;
    if (this.expandMore) {
      $('.presentationExpand ').addClass('Expand');
    } else { $('.presentationExpand ').removeClass('Expand') }
  }
  PPT_Data: any = [
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Active Management Reimagined",
      "slideDescription": "",
      "slideNote": "<p style=\"language: en-US; line-height: normal; text-indent: 0in; text-align: left; direction: ltr; unicode-bidi: embed; mso-vertical-align-alt: auto; mso-line-break-override: none; word-break: normal; punctuation-wrap: hanging; margin: 0pt 0in 0pt 0in;\"><span style=\"font-size: 18.0pt; font-family: Calibri; mso-ascii-font-family: Calibri; mso-fareast-font-family: Calibri; mso-bidi-font-family: 'Times New Roman'; color: black; mso-color-index: 1; mso-font-kerning: 1.0pt; language: en-US; mso-style-textfill-type: solid; mso-style-textfill-fill-themecolor: text1; mso-style-textfill-fill-color: black; mso-style-textfill-fill-alpha: 100.0%;\">&bull; Introduce NAA team members</span></p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-01_638574221740718670.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "1",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Performance",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_Avoid the Losers-08 1 (1)_638574342949352572.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "2",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "History of the firm and the team",
      "slideDescription": "",
      "slideNote": "<p style=\"language: en-US; margin-top: 0pt; margin-bottom: 0pt; margin-left: 0in; text-align: left; direction: ltr; unicode-bidi: embed; mso-line-break-override: none; word-break: normal; punctuation-wrap: hanging;\"><span style=\"font-size: 18.0pt; font-family: Calibri; mso-ascii-font-family: Calibri; mso-fareast-font-family: Calibri; mso-bidi-font-family: 'Times New Roman'; color: black; mso-color-index: 1; mso-font-kerning: 12.0pt; language: en-US; mso-style-textfill-type: solid; mso-style-textfill-fill-themecolor: text1; mso-style-textfill-fill-color: black; mso-style-textfill-fill-alpha: 100.0%;\">Need to update with TV-related milestones</span></p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_Avoid the Losers-02_638574185389506958.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "3",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Different thinking, different outcomes",
      "slideDescription": "",
      "slideNote": "<p><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">1.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">Our mission throughout this transition is to bring back the magic that was part of our early success when we worked at Guggenheim Partners. We know what it takes to run a successful fund business:</span></p> <p><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">2.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">We recognized that as a fund company, we had to provide more than a commodity, more than just fund management and performance.</span></p> <p><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">3.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">We had to help advisors build their businesses by assisting them to show their clients something different.</span></p> <p><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">4.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">When was the last time an advisor told a client something different? </span></p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"margin-bottom: 0in; mso-add-space: auto; line-height: normal;\">&nbsp;</p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"margin-left: .75in; mso-add-space: auto; text-indent: -13.5pt; mso-list: l0 level1 lfo2;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><strong><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">a)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></strong></span><!--[endif]--><span class=\"ui-provider\">We are reimagining active management with a <strong>different investment story</strong> that provides investors with different outcomes uncorrelated with other fund managers.</span></p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"margin-left: .75in; mso-add-space: auto; text-indent: -13.5pt; mso-list: l0 level1 lfo2;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">b)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\"><strong>A different quantitative stock selection process</strong> known as the h-factor will be introduced and combined with an active risk management process. </span></p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"mso-add-space: auto; text-indent: -13.5pt; line-height: normal; mso-list: l0 level1 lfo2; margin: 0in 0in 0in .75in;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">c)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">We will provide advisors with <strong>different technology</strong> they can&rsquo;t find anywhere else. Show a client what happens when you take any portfolio or ETF and improve it by removing the h-factor.<span style=\"mso-spacerun: yes;\">&nbsp; </span></span></p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"margin-left: .75in; mso-add-space: auto; text-indent: -13.5pt; mso-list: l0 level1 lfo2;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">d)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">Our distribution team is built with a<strong> different attitude, </strong>an attitude of service<strong>. </strong>The team will include key accounts and provide unparalleled support to advisors.<span style=\"mso-spacerun: yes;\">&nbsp;&nbsp; </span></span></p> <p class=\"MsoListParagraphCxSpLast\" style=\"margin-left: .75in; mso-add-space: auto; text-indent: -13.5pt; mso-list: l0 level1 lfo2;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">e)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">We will perpetually publish thought leadership pieces that show clients how the effects of <strong>different thinking</strong> can be incorporated into their portfolios.</span></p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_Avoid the Losers-03_638574194511302458.svg",
      "dynamicURL": "NULL",
      "slideStatus": "A",
      "slideOrder": "4",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Imperfect understanding of where alpha comes from",
      "slideDescription": "",
      "slideNote": "<p>1. &nbsp; &nbsp;We believe that many investors have an imperfect understanding of where alpha comes from. Investors think in terms of picking winners when their goal should be to avoid losers. (AKA) Overpriced stocks. Let me clarify...</p> <p>2. &nbsp; &nbsp;If you were to take all the components of the S&amp;P 500, and organize them around a circle by put winners at one end and losers at the other, and then ask a group of investors how build a portfolio to beat the S&amp;P 500, almost all of them would say to pick the winners.</p> <p>3. &nbsp; &nbsp;But to pick a winner, you need to have some level of knowledge of the future, and the future by definition is unknown, and the more you forecast the unknown future, the more you increase the likelihood you will be wrong and invest in a loser.</p> <p>4. &nbsp; &nbsp;With that in mind, we have built an investment process around deliberately avoiding losers, and in doing so, we have divorced ourselves from traditional portfolio management ideas and drawn on actuarial principles of the insurance industry.&nbsp;</p> <p>5. &nbsp; &nbsp;By using an actuarial approach to avoiding losers, I am going to show you a dramatic and differentiated source of alpha that is uncorrelated with traditional active managers, that can outperform across different investment universes, asset classes and geographies.&nbsp;</p> <p>6. &nbsp; &nbsp;So, what is a loser, when do you lose money.&nbsp;</p> <p>7. &nbsp; &nbsp;Well in simple terms it's an overpriced stock, and we believe there is only one cause of overpricing, and that's human behavior&nbsp;</p> <p>8. &nbsp; &nbsp;Over pricing is not caused by the fundamentals of a company, it's caused by humans.</p> <p>9. &nbsp; &nbsp;So how do humans overprice a stock? &nbsp;Well, we all know the efficient market hypothesis says that a company's stock price reflects all known information.</p> <p>10. &nbsp; &nbsp;This includes the knowable i.e., disclosed financial information, but in many instances, this also includes a lot of vague and ambiguous information.</p> <p>11. &nbsp; &nbsp;This distinction is very important. &nbsp;Vague and ambiguous information may be relevant to the stock price, but investors may not agree on how to interpret it. &nbsp;On the other hand, known information, because it is easy to interpret, is usually interpreted in a consistent way among investors and therefore it is impounded into prices far more accurately.</p> <p>12. &nbsp; &nbsp;We believe humans interpret vague and ambiguous information in a systematically incorrect way.&nbsp;</p> <p>13. &nbsp; &nbsp;This happens in the stock market all the time. When Steve Jobs passed away half the investing population interpreted this as a good thing, pushing the stock higher, the other half saw it as bad. They were relying on information that was vague and ambiguous at best. &nbsp;</p> <p>14. &nbsp; &nbsp;Look at Tesla or the Covid epidemic or GameStop. There is an overwhelming amount of vague and ambiguous information - there is probably more vague and ambiguous information than there is known information.</p> <p><br>15. &nbsp; &nbsp;It's the risk that arises from human behavior that makes the stock risky, regardless of how risky the company is. &nbsp;It's the risk of overpricing, it's a risk that leads to loss and unlike firm specific risk, it cannot be diversified away, it can only be avoided.</p> <p><br>16. &nbsp; &nbsp;We call this risk the h-factor, and it is the foundation of everything that we do at New Age Alpha</p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_Avoid the Losers-14_638574248589186137.svg",
      "dynamicURL": "NULL",
      "slideStatus": "A",
      "slideOrder": "5",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Manage risk like an actuary not like a portfolio manager",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_Avoid the Losers-13_638574257691522147.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "6",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Active Management Reimagined slide 14",
      "slideDescription": "",
      "slideNote": "<ol style=\"margin-top: 0in;\" start=\"1\" type=\"1\"> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">The chart you see here really encapsulates our thesis&hellip;Which is that the h-Factor works.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">we contend that low h-factor stocks outperform high h-factor stocks over time.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">In this chart, which examines the period 2003 to the present, you can see that the quartile of the S&amp;P 500 that includes high h-factor stocks, in red, underperforms the quartile of low h-factor stocks, shown in green, by an annualized rate of almost 4.0%.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">Because we formed these quartiles on an equal-weight basis we also compare them to the S&amp;P 500 equal weight index.<span style=\"mso-spacerun: yes;\">&nbsp; </span>And as you can see, High h-factor trails this index, while low h-factor beats it.<span style=\"mso-spacerun: yes;\">&nbsp;&nbsp; </span></li> <li class=\"MsoNormal\" style=\"color: red; mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"color: windowtext;\">What&rsquo;s also important to note, is that the low H-Factor quartile comes with less volatility and a much higher Sharpe ratio.<span style=\"mso-spacerun: yes;\">&nbsp; </span></span>Note on how many times it outperforms</li> </ol>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA Active Management Reimagined-06-01_638574227290808742.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "7",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Avoiding losers is an uncorrelated source of return",
      "slideDescription": "",
      "slideNote": "<ol style=\"margin-top: 0in;\" start=\"1\" type=\"1\"> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"background: white; mso-highlight: white;\">Moving on, we have 2 charts that go into more detail on factor exposure and correlation.</span></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"background: white; mso-highlight: white;\">In top chart, we have chosen to focus on nine common factors to examine the performance of the H-Factor.&nbsp;&nbsp;</span></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"background: white; mso-highlight: white;\">To support our contention that the H-Factor is capturing something totally different, we performed an X-Ray analysis.&nbsp; The X-Ray of the H-factor shows the combination of factors, at any point in time, that best explains the returns of the H-Factor over the prior 20 years.&nbsp; &nbsp; &nbsp;</span></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"background: white; mso-highlight: white;\">For example, you can see that prior to 2015, the performance of the H-Factor was largely explained by the quality factor, which is shown in orange.&nbsp; In 2008, it was largely explained by the profitability factor, shown in green.&nbsp; In other years a combination of factors did the best job explaining the performance of the H-Factor.&nbsp; &nbsp; </span></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><strong><span style=\"background: white; mso-highlight: white;\">The key takeaway is that Human Factor's exposure is dynamic and constantly changing.</span></strong></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">Now to analyze further, we can look at the correlation metrics below.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">A question we get a lot is, how correlated H-Factor is with traditional risk factors. That is, is H-Factor simply another factor by a different name&hellip;and the answer is no.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">To show this, we performed a correlation analysis of H- Factor and nine commonly used factors such as size, value, profitability, volatility and others. This shows how H-Factor is correlated with other factors individually.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">Looking at each of them individually, we can see that the highest correlation H-Factor has in either direction with any of them is 0.54 (out of 1), which as we know is relatively low.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">And with that, we would be happy to take any questions, but we just wanted to give an overview of our methodology and how it works before getting into the specific strategy we are talking about today.</li> </ol>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA Active Management Reimagined-07-01_638574227512990888.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "8",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Dynamic factor exposure",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240718_NAA Active Management Reimagined-14-01_638574227659390830.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "9",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Disclosures",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-07_638574229558518010.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "10",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR Avoid the losers",
      "slideName": "Disclosures 2",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-08_638574231865339050.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "11",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    }
  ]
  PPT_Data_Dynamic: any = [
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "Active Management Reimagined",
      "slideDescription": "",
      "slideNote": "<p style=\"language: en-US; line-height: normal; text-indent: 0in; text-align: left; direction: ltr; unicode-bidi: embed; mso-vertical-align-alt: auto; mso-line-break-override: none; word-break: normal; punctuation-wrap: hanging; margin: 0pt 0in 0pt 0in;\"><span style=\"font-size: 18.0pt; font-family: Calibri; mso-ascii-font-family: Calibri; mso-fareast-font-family: Calibri; mso-bidi-font-family: 'Times New Roman'; color: black; mso-color-index: 1; mso-font-kerning: 1.0pt; language: en-US; mso-style-textfill-type: solid; mso-style-textfill-fill-themecolor: text1; mso-style-textfill-fill-color: black; mso-style-textfill-fill-alpha: 100.0%;\">&bull; Introduce NAA team members</span></p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-01_638574221740718670.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "1",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "NAA Funds on Platform",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-02_638574222177236596.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "2",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "History of the firm and the team",
      "slideDescription": "",
      "slideNote": "<p style=\"language: en-US; margin-top: 0pt; margin-bottom: 0pt; margin-left: 0in; text-align: left; direction: ltr; unicode-bidi: embed; mso-line-break-override: none; word-break: normal; punctuation-wrap: hanging;\"><span style=\"font-size: 18.0pt; font-family: Calibri; mso-ascii-font-family: Calibri; mso-fareast-font-family: Calibri; mso-bidi-font-family: 'Times New Roman'; color: black; mso-color-index: 1; mso-font-kerning: 12.0pt; language: en-US; mso-style-textfill-type: solid; mso-style-textfill-fill-themecolor: text1; mso-style-textfill-fill-color: black; mso-style-textfill-fill-alpha: 100.0%;\">Need to update with TV-related milestones</span></p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_Avoid the Losers-02_638574185389506958.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "3",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "Different thinking, different outcomes",
      "slideDescription": "",
      "slideNote": "<p><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">1.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">Our mission throughout this transition is to bring back the magic that was part of our early success when we worked at Guggenheim Partners. We know what it takes to run a successful fund business:</span></p> <p><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">2.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">We recognized that as a fund company, we had to provide more than a commodity, more than just fund management and performance.</span></p> <p><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">3.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">We had to help advisors build their businesses by assisting them to show their clients something different.</span></p> <p><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">4.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">When was the last time an advisor told a client something different? </span></p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"margin-bottom: 0in; mso-add-space: auto; line-height: normal;\">&nbsp;</p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"margin-left: .75in; mso-add-space: auto; text-indent: -13.5pt; mso-list: l0 level1 lfo2;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><strong><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">a)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></strong></span><!--[endif]--><span class=\"ui-provider\">We are reimagining active management with a <strong>different investment story</strong> that provides investors with different outcomes uncorrelated with other fund managers.</span></p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"margin-left: .75in; mso-add-space: auto; text-indent: -13.5pt; mso-list: l0 level1 lfo2;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">b)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\"><strong>A different quantitative stock selection process</strong> known as the h-factor will be introduced and combined with an active risk management process. </span></p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"mso-add-space: auto; text-indent: -13.5pt; line-height: normal; mso-list: l0 level1 lfo2; margin: 0in 0in 0in .75in;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">c)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">We will provide advisors with <strong>different technology</strong> they can&rsquo;t find anywhere else. Show a client what happens when you take any portfolio or ETF and improve it by removing the h-factor.<span style=\"mso-spacerun: yes;\">&nbsp; </span></span></p> <p class=\"MsoListParagraphCxSpMiddle\" style=\"margin-left: .75in; mso-add-space: auto; text-indent: -13.5pt; mso-list: l0 level1 lfo2;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">d)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">Our distribution team is built with a<strong> different attitude, </strong>an attitude of service<strong>. </strong>The team will include key accounts and provide unparalleled support to advisors.<span style=\"mso-spacerun: yes;\">&nbsp;&nbsp; </span></span></p> <p class=\"MsoListParagraphCxSpLast\" style=\"margin-left: .75in; mso-add-space: auto; text-indent: -13.5pt; mso-list: l0 level1 lfo2;\"><!-- [if !supportLists]--><span class=\"ui-provider\"><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">e)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp; </span></span></span></span><!--[endif]--><span class=\"ui-provider\">We will perpetually publish thought leadership pieces that show clients how the effects of <strong>different thinking</strong> can be incorporated into their portfolios.</span></p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_Avoid the Losers-03_638574194511302458.svg",
      "dynamicURL": "NULL",
      "slideStatus": "A",
      "slideOrder": "4",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "A differentiated story – The cost of a hidden risk",
      "slideDescription": "",
      "slideNote": "<p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">1.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->We believe every portfolio has a hidden risk, and investors aren&rsquo;t rewarded for taking this risk.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">2.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->In fact, it&rsquo;s a risk that costs investors&rsquo; money.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">3.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->On the left, you can see the S&amp;P 500 with the hidden risk removed; on the right, you can see the S&amp;P 500 as it is.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">4.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->As you can see in orange, removing this hidden risk adds over 2.5 percent of annualized alpha since 2001.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">5.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Now, let&rsquo;s talk more about this risk and show you how its measured.</p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-05_638574223434413424.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "5",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "The hidden risk – It comes from human behavior",
      "slideDescription": "",
      "slideNote": "<p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">1.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->In investing, there are priced risks, risks we are aware of and get rewarded for taking. These are the classic risk factors we have all become used to and aware of.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">2.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->This hidden risk is part of idiosyncratic risk. However, unlike firm-specific risks, like a catastrophe at the plant or the sudden death of a CEO, which can be diversified away, this hidden risk stems not from things happening to the company but from things happening to the stock. This hidden risk cannot be diversified away; it can only be avoided.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">3.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Human behavior creates this risk and causes the stock to be mispriced.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">4.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->To identify and avoid these mispriced stocks, we have developed the <strong>h-factor, which is</strong> the foundation of everything we do here at New Age Alpha</p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-06_638574223662728348.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "6",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "How we measure the impact of human behavior",
      "slideDescription": "",
      "slideNote": "<p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">1.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->We believe companies that can deliver growth, as implied by their stock price, will increase in value.<span style=\"mso-spacerun: yes;\">&nbsp; </span>We invest in these companies. We employ our proprietary h-factor to avoid those that cannot.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">2.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Calculating the h-factor Score is a 3-step statistics-based process:</p> <p class=\"MsoListParagraphCxSpMiddle\">&nbsp;</p> <p class=\"MsoListParagraphCxSpLast\" style=\"mso-add-space: auto; text-indent: -.25in; line-height: normal; mso-list: l0 level1 lfo1; margin: 0in 0in 0in .75in;\"><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">a)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Step one is calculating the implied growth rate. I.e., what does this stock price imply in terms of required growth to justify the current stock price? We start with the company's current stock price, and using valuation models provided by market participants, we solve backward to determine the company's implied growth rate.</p> <p class=\"MsoNormal\" style=\"text-indent: -.25in; line-height: normal; mso-list: l0 level1 lfo1; margin: 0in 0in 0in .75in;\"><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">b)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Next, the implied growth is compared with each stock's historical growth rate from the past 12 quarters, and 10,000 simulations are run to determine a curve with growth rate possibilities.</p> <p class=\"MsoNormal\" style=\"text-indent: -.25in; line-height: normal; mso-list: l0 level1 lfo1; margin: 0in 0in 0in .75in;\"><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">c)<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->Finally, we compare the IGR to the calculated growth rate possibilities by placing the IGR on the curve.</p> <p class=\"MsoNormal\" style=\"margin-bottom: 0in; line-height: normal;\">&nbsp;</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">3.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->The comparison yields the h-factor, which is the probability the company will fail to deliver the growth rate implied by its stock price. The lower the score, the better.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">4.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->It's actuarial math. We avoid vague and ambiguous forecasts or news and use only what we know about a company, its stock price, and its underlying fundamentals.</p> <p><!-- [if !supportLists]--><span style=\"mso-bidi-font-family: Calibri; mso-bidi-theme-font: minor-latin;\"><span style=\"mso-list: Ignore;\">5.<span style=\"font: 7.0pt 'Times New Roman';\">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; </span></span></span><!--[endif]-->The h-factor is calculated in real time and updated daily for over 6000 stocks.</p>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_Avoid the Losers-12_638574226733458406.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "7",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "Active Management Reimagined-slide8",
      "slideDescription": "",
      "slideNote": "<ul> <li>Now, to illustrate this further, I&rsquo;ll pull up some screenshots from our investment platform, SPACE, to show you an example of how we avoid these overpriced stocks and how it impacts overall performance.</li> <li>What you are seeing here is a screenshot of our advisor facing platform that we created to assist with advisor due diligence and distribution. It allows advisors to not only see h-factor scores in real time, but also see how removing high h-factor from any given investment universe impacts performance.</li> <li>GO THROUGH 25, 50, 80</li> <li>With that, I will pause for any questions, and if you would like, we can take a look at a case study to give an example of how an h-factor score changes throughout time.</li> </ul>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240718_NAA Active Management Reimagined-07-01_638574225962644234.svg",
      "dynamicURL": "https://presentations.newagealpha.com/Presentation/dynamic-pages/manage-risk/investments-universe.aspx",
      "slideStatus": "A",
      "slideOrder": "8",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "GME Case study",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240718_NAA Active Management Reimagined-10-01 2_638574225558786580.svg",
      "dynamicURL": "https://presentations.newagealpha.com/Presentation/dynamic-pages/manage-risk/h-factor-case-study.aspx",
      "slideStatus": "A",
      "slideOrder": "9",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "Active Management Reimagined slide 14",
      "slideDescription": "",
      "slideNote": "<ol style=\"margin-top: 0in;\" start=\"1\" type=\"1\"> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">The chart you see here really encapsulates our thesis&hellip;Which is that the h-Factor works.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">we contend that low h-factor stocks outperform high h-factor stocks over time.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">In this chart, which examines the period 2003 to the present, you can see that the quartile of the S&amp;P 500 that includes high h-factor stocks, in red, underperforms the quartile of low h-factor stocks, shown in green, by an annualized rate of almost 4.0%.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">Because we formed these quartiles on an equal-weight basis we also compare them to the S&amp;P 500 equal weight index.<span style=\"mso-spacerun: yes;\">&nbsp; </span>And as you can see, High h-factor trails this index, while low h-factor beats it.<span style=\"mso-spacerun: yes;\">&nbsp;&nbsp; </span></li> <li class=\"MsoNormal\" style=\"color: red; mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"color: windowtext;\">What&rsquo;s also important to note, is that the low H-Factor quartile comes with less volatility and a much higher Sharpe ratio.<span style=\"mso-spacerun: yes;\">&nbsp; </span></span>Note on how many times it outperforms</li> </ol>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA Active Management Reimagined-06-01_638574227290808742.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "10",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "Avoiding losers is an uncorrelated source of return",
      "slideDescription": "",
      "slideNote": "<ol style=\"margin-top: 0in;\" start=\"1\" type=\"1\"> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"background: white; mso-highlight: white;\">Moving on, we have 2 charts that go into more detail on factor exposure and correlation.</span></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"background: white; mso-highlight: white;\">In top chart, we have chosen to focus on nine common factors to examine the performance of the H-Factor.&nbsp;&nbsp;</span></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"background: white; mso-highlight: white;\">To support our contention that the H-Factor is capturing something totally different, we performed an X-Ray analysis.&nbsp; The X-Ray of the H-factor shows the combination of factors, at any point in time, that best explains the returns of the H-Factor over the prior 20 years.&nbsp; &nbsp; &nbsp;</span></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><span style=\"background: white; mso-highlight: white;\">For example, you can see that prior to 2015, the performance of the H-Factor was largely explained by the quality factor, which is shown in orange.&nbsp; In 2008, it was largely explained by the profitability factor, shown in green.&nbsp; In other years a combination of factors did the best job explaining the performance of the H-Factor.&nbsp; &nbsp; </span></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\"><strong><span style=\"background: white; mso-highlight: white;\">The key takeaway is that Human Factor's exposure is dynamic and constantly changing.</span></strong></li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">Now to analyze further, we can look at the correlation metrics below.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">A question we get a lot is, how correlated H-Factor is with traditional risk factors. That is, is H-Factor simply another factor by a different name&hellip;and the answer is no.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">To show this, we performed a correlation analysis of H- Factor and nine commonly used factors such as size, value, profitability, volatility and others. This shows how H-Factor is correlated with other factors individually.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">Looking at each of them individually, we can see that the highest correlation H-Factor has in either direction with any of them is 0.54 (out of 1), which as we know is relatively low.</li> <li class=\"MsoNormal\" style=\"mso-list: l0 level1 lfo1; tab-stops: .5in;\">And with that, we would be happy to take any questions, but we just wanted to give an overview of our methodology and how it works before getting into the specific strategy we are talking about today.</li> </ol>",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA Active Management Reimagined-07-01_638574227512990888.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "11",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "Dynamic factor exposure",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240718_NAA Active Management Reimagined-14-01_638574227659390830.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "12",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "Disclosures",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-07_638574229558518010.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "13",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    },
    {
      "presentationName": "NAA AMR The Hidden Risk PPT",
      "slideName": "Disclosures 2",
      "slideDescription": "",
      "slideNote": "",
      "slideImage": "https://presentations.newagealpha.com/assets/images/SLider/present1/240723_NAA AMR_The Hidden Risk-08_638574231865339050.svg",
      "dynamicURL": "",
      "slideStatus": "A",
      "slideOrder": "14",
      "slideAudio": "",
      "slideVideo": "",
      "isAnimated": "0"
    }
  ];
}
