import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { isNullOrUndefined, isNotNullOrUndefined, SharedDataService } from '../../services/sharedData/shared-data.service';
import { AuthenticationService } from '../../authentication/authentication.service';
import { DataService } from '../../services/data/data.service';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { DialogNavComponent } from './dialog-nav/dialog-nav.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { MatDialog } from '@angular/material/dialog';
import { Subscription, first } from 'rxjs';
// @ts-ignore
import * as d3 from 'd3';
import { UserService } from '../../services/user/user.service';
import { Router } from '@angular/router';
import { DirectIndexService } from '../../services/moduleService/direct-index.service';
import { CustomIndexService } from '../../services/moduleService/custom-index.service';
import { ToastrService } from 'ngx-toastr';
import { RebalanceNavComponent } from '../../Dialogs/rebalance-nav/rebalance.component';
import { FeedbackComponent } from '../../../view/feedback/feedback.component';
import { OKTA_AUTH } from '@okta/okta-angular';
import OktaAuth from '@okta/okta-auth-js';
import { SlickCarouselComponent } from 'ngx-slick-carousel';
import { GlobalSearchService } from '../../services/global-search.service';
import { CdkDrag, CdkDragMove } from '@angular/cdk/drag-drop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { EquityUniverseService } from '../../services/moduleService/equity-universe.service';
import { UserSettings } from '../../services/user/user';
// @ts-ignore
declare var $;
declare const gsap: any;
@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.scss',
})
export class NavMenuComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('iframe', { static: false }) iframe!: ElementRef;
  subscriptions = new Subscription();
  isPPTModalOpen: boolean = false;
  isPPTModalOpenIndex: number = 0;
  isPPTModalMinimize: boolean = false;
  showtoNavSlides: boolean = false;
  @ViewChild('slickModal') slickModal!: SlickCarouselComponent;
  @ViewChild('slickModalPPT') slickModalPPT!: SlickCarouselComponent;
  @ViewChild('dragWindow', { read: CdkDrag }) dragWindowRef!: CdkDrag;
  uname: string = '';
  name: any;
  ScoresDt: string = "";
  version: any;
  GetToolIcons: any = [];
  showDelay = new FormControl(100);
  hideDelay = new FormControl(100);
  slideHgt_drpdwn: boolean = false;
  //setting_drpdwn: boolean = false;
  //profile_drpdwn: boolean = false;
  ///// Environment Change
  Change_header_LD: string = "demo";
  Change_header_Env: boolean = true;
  showLiveDemoToggle: boolean = false;
  showSpinnerSlides: boolean = true;
  isMovetop: boolean = false;
  ///// Environment Change
  dragPositionPPT = { x: 0, y: 0 };
  onDragMoved(event: CdkDragMove) {
    this.dragPositionPPT = event.pointerPosition;
  }
  isHidePPT() {
    var that = this;
    const windowElement:any = document.getElementById("window");
    const dockElement: any = document.getElementById("showPPTIcon");
    ////if (isNotNullOrUndefined(windowElement)) {
    ////  const windowRect = windowElement.getBoundingClientRect();
    ////  const dockRect = dockElement.getBoundingClientRect();
    ////  const targetX = dockRect.left + dockRect.width / 2 - windowRect.width / 2;
    ////  const targetY = dockRect.top + dockRect.height / 2 - windowRect.height / 2;
    ////  //console.log(targetX, targetY);
    ////  gsap.to(windowElement, {
    ////    duration: 0.5,
    ////    scale: 0.2,
    ////    x: targetX - windowRect.left,
    ////    y: targetY - windowRect.top,
    ////    opacity: 0,
    ////    ease: "ease.out",
    ////    onComplete: () => {
    ////      /*isMinimized = true;*/
    ////     // windowElement.style.pointerEvents = "none"; // Disable interaction when minimized
    ////      //gsap.to(windowElement, { scale: 0, opacity: 0, transform:'none' })
    ////      that.showtoNavSlides = false;
    ////    },
    ////  });
    ////  gsap.to(dockElement, {scale: 1, opacity:1, ease: "ease.in" })

    ////}
    gsap.to(dockElement, { scale: 1, opacity: 1, ease: "ease.in" })
    that.showtoNavSlides = false;
  }
  private firstTimeOpen = true;
  isShowPPT() {
    var that = this;
    //this.imageLoaded = new Array(this.slides.length).fill(false);
    //  if (!this.allImagesLoaded) {
    //    this.imageLoaded = []; // Reset only if not fully loaded
    //  }
   /* console.log('All images loaded:', !this.imageLoaded, this.imageLoaded.length, this.slides.length - 1);*/
    if (!this.imageLoaded || this.imageLoaded.length !== this.slides.length) {
      this.imageLoaded = [];
      this.allImagesLoaded = false;
    } else {
      if (this.imageLoaded.length >= this.slides.length - 1) {
        setTimeout(() => { this.allImagesLoaded = true; }, 10000)
      }

    }
   
    const windowElement: any = document.getElementById("window");
    const dockElement: any = document.getElementById("showPPTIcon");
    that.showtoNavSlides = true;
    gsap.to(dockElement, { scale: 0, opacity: 0, ease: "ease.out" })
    // Reset visual transform
    const dragElement = this.dragWindowRef?.getRootElement();
    if (dragElement) {
      dragElement.style.transform = 'translate(0px, 0px)';
    }

    if (this.dragWindowRef?._dragRef) {
      this.dragWindowRef._dragRef.setFreeDragPosition({ x: 0, y: 0 });
    }
    this.dragPositionPPT = { x: 0, y: 0 };

    /*** Initiate modal before opening ***/
    that.slides_Modal = [...that.slides];
    that.iframeDomLoaded = true;
    that.slickModalPPT.unslick(); // Uninitialize slick slider
    that.slickModalPPT.initSlick(); // Reinitialize slick slider
    //that.slickModalPPT.slickGoTo(0);
    /*** Initiate modal before opening ***/
  }
  imageLoaded: boolean[] = [];
  allImagesLoaded = false;
  onImageLoad(idx: number): void {
    this.imageLoaded[idx] = true;
    const allLoaded = this.imageLoaded.every(loaded => loaded === true);
    //console.log('All images loaded:', allLoaded, this.imageLoaded);
    /*console.log('All images loaded:', this.imageLoaded.length, this.slides.length - 1, this.imageLoaded.every(loaded => loaded));*/
    if (
      this.imageLoaded.length >= (this.slides.length - 1) &&
      this.imageLoaded.every(loaded => loaded)
    ) {
      this.allImagesLoaded = true;
    }
  }

  pptimgHoverClass() {
    var pageH = window.innerHeight;
    var calc75 = pageH * 0.60;
    if (this.dragPositionPPT['y'] > calc75) {
      return true;
    } else { return false }
  }
  //okta Setting
  companies: any = [];
  tabcompanies: any = [];
  oktaEdit: boolean = false;
  companyName: any = "";
  clientId: any = "";
  issuer: any = "";
  selOkta: any;
  scrWidth: any;
  oktaFormGroup: FormGroup;
  showSpinnerAcc_loaded: boolean = true;
 
  @HostListener('window:resize', ['$event'])
  
  slideConfig: any;
  topMenuSlidetoShow: number = 3;
  topMenuSlidetoShowWidth: string = '20rem';
  slides: any = [];
  slides_Modal: any = [];
  //lighmode: boolean = false;
  onResize(event: Event): void {
    this.getWindowWidth();
  }
  isVideoPlaying: boolean = false
  playVideo(slide: any) {
    this.isVideoPlaying = true;
  }
  getWindowWidth(): void {
    if (window.matchMedia("(orientation: portrait)").matches) {
      $('#landscapeModal').modal('show');
      /*console.log("Please use Landscape!")*/
    } else {
      $('#landscapeModal').modal('hide');
     /* console.log("Please use Portrait")*/
    }
  }

  glbSearch = new FormControl('');
  constructor(public sharedData: SharedDataService, public equityService: EquityUniverseService, private formBuilder: FormBuilder, private sanitizer: DomSanitizer, private cdr: ChangeDetectorRef,
    private toastr: ToastrService, @Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
    private userService: UserService, private dirIndexService: DirectIndexService,
    public cusIndexService: CustomIndexService, private authenticationService: AuthenticationService,
    private dataService: DataService, public dialog: MatDialog, private router: Router, private gloSrcService: GlobalSearchService) {
    var currentUser = this.authenticationService.currentUserValue;
    if (isNotNullOrUndefined(currentUser)) {
      this.name = currentUser.firstName + ' ' + currentUser.lastName;
    } else { this.name = ''; }
   
    const urlRegex = /^(?:http(s)?:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/;
    this.oktaFormGroup = this.formBuilder.group({
      companyName: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100)]],
      clientId: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      issuer: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(100), Validators.pattern(urlRegex)]]
    });

    this.glbSearch.setValidators([noDoubleSpaceValidator()]);
    this.glbSearch.valueChanges.subscribe((srcValue: any) => { this._filter(srcValue) });
  }
  noDataFound: boolean = false;
  searchEnter: boolean = false;
  filteredOptions: any = [];
  showSearchLoader: boolean = false;
  isLoadedPPTSlides: boolean = false;
  GlobalSearch: any;
  filtering(ev: any) { this.searchEnter = true; };
  inputValue: string = '';
  clearInput() {
    this.inputValue = '';
    //this.sharedData.userEventTrack('Header Nav', "Search", 'Search Clear', 'Search Clear Click');
  };

  restrictDoubleSpace(event: KeyboardEvent): void {
    const input = this.inputValue;
    const char = event.key;
    if ((char === ' ' && (input.endsWith(' '))) || (char === ' ' && input.trim().length ==0)) { event.preventDefault(); }
  }

  private _filter(value: any) {
    this.filteredOptions = [];
    this.showSearchLoader = true;
    this.searchEnter = false;
    var doubleSpace: boolean = this.glbSearch?.hasError('doubleSpace');
    var max: boolean = this.glbSearch?.hasError('max');
    if (doubleSpace) { this.glbSearch.setValue(value.replaceAll('  ',' ')); }
    try { this.GlobalSearch.unsubscribe(); } catch (e) { }
    if (isNotNullOrUndefined(value) && value != "" && value.trim() != "" && !doubleSpace && !max && this.glbSearch.valid) {
      this.GlobalSearch = this.dataService.GlobalSearch(value).pipe(first())
        .subscribe((res: any) => {
          // this.filteredOptions = [...res];
          const order = ['Equity Universe', 'ETF', 'DirectIndexing', 'PreBuilt', 'Thematic'];
          let groupedData = res.reduce((acc: any, item: any) => {
            let typeGroup = acc.find((group: any) => group.type === item.type);
            if (typeGroup) {
              typeGroup.items.push(item);
            } else {
              acc.push({ type: item.type, items: [item] });
            }
            return acc;
          }, []);
          groupedData.sort((a: any, b: any) => {
            return order.indexOf(a.type) - order.indexOf(b.type);
          });
          this.filteredOptions = groupedData
          //console.log('groupedData', groupedData);
          this.showSearchLoader = false;
          this.noDataFound = res.length === 0;
          if (this.noDataFound) {
            d3.select(".DrilldownSearchBar").classed("no_DF", true);
          } else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
          if (this.searchEnter && res.length > 0) {
            var val = { option: { value: res[0] } };
            this.gloSrcEnter(val);
            this.searchEnter = false;
          };
        });
    } else {
      this.noDataFound = !this.glbSearch.valid;
      if (this.noDataFound) {
        d3.select(".DrilldownSearchBar").classed("no_DF", true);
      } else { d3.select(".DrilldownSearchBar").classed("no_DF", false); }
      this.filteredOptions = []; this.showSearchLoader = false;
    }
  }
  inputFocused(eV: any, type: any) { if (type == 'in') { this.noDataFound = false; } };
  onInputChange(value: string) { if (value.length == 0) { this.noDataFound = false; } };
  gloSrcEnter(ev: any) {
    if (isNotNullOrUndefined(ev) && isNotNullOrUndefined(ev.option) && isNotNullOrUndefined(ev.option.value)) {
      var value: any = ev.option.value;
      if (isNotNullOrUndefined(value['type']) && (value instanceof Object)) {
        this.gloSrcService.gloSrcEnter(value);
        this.glbSearch.reset();
        this.noDataFound = false;
      } else { }
    } else { }
  }
  ngOnDestroy() { this.subscriptions.unsubscribe(); this.sharedData.GetAllPresentationdata.next([]) }
  onFullscreenChange() {
    if (!document.fullscreenElement &&
      !(document as any).webkitFullscreenElement &&
      !(document as any).mozFullScreenElement &&
      !(document as any).msFullscreenElement) {
      // Fullscreen mode is exited
      this.fullscreen_icon = true;
      $('#fullScreens').removeClass('fullsizeScreen');
    }
  }
 runPPTSlideOnce: boolean = true;
  ngOnInit() {
    var that = this;
    /*Check PPT API*/
    //var unSubUTRPData = this.sharedData.UserTabsRolePermissionData.subscribe(res => {
    //  if (isNotNullOrUndefined(res) && res.length > 0 && !this.showtoNavSlides) { };
    //});
    //that.subscriptions.add(unSubUTRPData);
    var MenuPermission = this.sharedData.UserMenuRolePermission.subscribe(res => {
      if (res.length > 0 && this.runPPTSlideOnce) {
        if (that.sharedData.checkShowLeftTab(2032) == 'A' && that.sharedData.checkMenuPer(2032, 2264) == 'Y' && that.showSliderPmode) {
          setTimeout(() => {
            that.getPPTSlides();
          }, 200)
          this.runPPTSlideOnce = false;
        }
      }
    });
    var getPresentationMode1 = this.sharedData.getPresentationMode.subscribe((res: any) => {
        if (res == 'N') { this.sharedData.GetAllPresentationdata.next([]) }
        else {
          if (that.sharedData.checkShowLeftTab(2032) == 'A' && that.sharedData.checkMenuPer(2032, 2264) == 'Y') {
            that.getPPTSlides();
          }
         }
    });
    /*Check PPT API*/
   
    that.getWindowWidth();
    document.addEventListener('fullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('webkitfullscreenchange', this.onFullscreenChange.bind(this));
    document.addEventListener('msfullscreenchange', this.onFullscreenChange.bind(this));
    this.fillPreference();
    var GetToolIcons = this.dataService.GetToolIcons().subscribe(res => {
      this.GetToolIcons = res;
      this.GetToolIcons = this.GetToolIcons.sort(function (x:any, y:any) { return d3.ascending(x.Orderby, y.Orderby); });
    }, error => { });
    var unSub1 = that.sharedData.GetAllPresentationdata.subscribe(res => {
      //console.log(res);
      if (res.length > 0) {
        that.openDefaultPPT(res);
      }
    });
    var unSub1 = that.sharedData.openNotification.subscribe(res => { that.showNotify = res; });
    var getPresentationMode = that.sharedData.getPresentationMode.subscribe(res => { that.openPresentation(res) });
    var getFontSettings = that.sharedData.getFontSettings.subscribe(res => { that.opeFontSize(res) });
    var getThemeColor = that.sharedData.getThemeColorMode.subscribe(res => { that.openThemeColor(res) });
    var unSub11 = that.sharedData.openTradeNotification.subscribe(res => { that.showTradeNotify = res; });
    this.subscriptions.add(GetToolIcons);
    this.subscriptions.add(unSub11);
    this.subscriptions.add(unSub1);
    this.subscriptions.add(getPresentationMode);
    var move_defaultAccount = this.dirIndexService.errorList_Direct.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) { this.checkErrorAction(res); }
    });

    var openNotification = this.cusIndexService.errorList_custom.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) { this.checkErrorAction(res); }
    });
    this.subscriptions.add(openNotification);
   
    ////var getTradeNotificationQueue = that.sharedData.getTradeNotificationQueue.subscribe(res => {
    ////  that.sharedData.getTradeNotificationQueue = res.filter((x: any) => x.displayQueue != 'N');
    ////console.log('getTradeNotificationQueue', that.sharedData.getTradeNotificationQueue, res);
    ////  that.sharedData.getTradeNotificationQueueCount.next(that.sharedData._getTradeNotificationQueue.length);
    ////});
    ////this.subscriptions.add(getTradeNotificationQueue);
    var getRebalancesPopupData = this.sharedData.getRebalancesPopupData.subscribe((res: any) => {
      if (isNotNullOrUndefined(res)) { this.getRebalances(res); }
    });
    this.subscriptions.add(getRebalancesPopupData);
    this.subscriptions.add(move_defaultAccount);

    var GetSchedularMaster = this.sharedData.GetSchedularMaster.subscribe(GetSchedularMaster => {
      var d: any = GetSchedularMaster;
      if (d.length > 0) {
        if (isNotNullOrUndefined(d[0]['AppVersion'])) { this.version = d[0]['AppVersion']; }
        if (isNotNullOrUndefined(d[0]['ScoresDt'])) {
          var da = new Date(d[0]['ScoresDt']);
          this.ScoresDt = this.sharedData.formatedates(da.getMonth() + 1).toString() + '/' + this.sharedData.formatedates(da.getDate()).toString() + "/" + da.getFullYear().toString();
        }
      }
    });
    this.subscriptions.add(GetSchedularMaster);

    var getNotificationQueue = that.sharedData.getNotificationQueue.subscribe(res => { var getNotifyData = [...this.sharedData.loadNotifyData()]; });
    var getHNotificationQueue = that.sharedData.getHNotificationQueue.subscribe(res => { var getNotifyData = [...this.sharedData.loadNotifyData()]; });
    var getTradeNotificationQueue = that.sharedData.getTradeNotificationQueue.subscribe(res => { var getNotifyData = [...this.sharedData.loadNotifyData()]; });

    this.subscriptions.add(getNotificationQueue);
    this.subscriptions.add(getHNotificationQueue);
    this.subscriptions.add(getTradeNotificationQueue);

    var openPinnedLeftSide: any = this.sharedData.openPinnedLeftSide.subscribe((res: any) => {
      const userData:any = this.sharedData.userPrefData.getValue();
      if (isNotNullOrUndefined(userData) && Array.isArray(userData)  && userData.length > 0) {
        that.savePinnedPreference();
      }
    });
    var openPinnedRightSide: any = this.sharedData.openPinnedRightSide.subscribe((res: any) => {
      const userData: any = this.sharedData.userPrefData.getValue();
      if (isNotNullOrUndefined(userData) && Array.isArray(userData) && userData.length > 0) {
        that.savePinnedPreference();
      }
    });
    this.subscriptions.add(openPinnedLeftSide);
    this.subscriptions.add(openPinnedRightSide);
  }
  checkErrorAction(checkError:any) {
    if (checkError.destination == 'openNotificationQueue') {
      /*** open Notification Queue **/
      this.showNotify = true;
      this.sharedData.openNotification.next(true);
      /*** open Notification Queue **/
      this.dirIndexService.errorList_Direct.next(undefined);
      this.cusIndexService.errorList_custom.next(undefined);
    }
    else if (checkError.destination == 'goToDashboard') { this.openUniverseMenuClose(); }
  }
  
  openDefaultPPT(d:any) {
    var that = this;
    /* reset nav slides */
    that.slides = [];
    that.imageLoaded = new Array(this.slides.length).fill(false);
    that.slides_Modal = [];
    that.showtoNavSlides = false;
    that.isPPTModalOpenIndex = 0;
    /* reset nav slides */
    /*filter set as default one*/
    var filterDefault = d.filter((x: any) => x.defaultPresentation != 0);
    if (isNotNullOrUndefined(filterDefault) && filterDefault.length > 0) {
      /*get default PPT SLides*/
      var postData = { "pid": filterDefault[0].id }
      that.getParticularSlides(postData);
      /*Show top nav PPT*/

    } else {
      /* load recent saved PPT */
      var postData = { "pid": d[0].id }
      that.getParticularSlides(postData);
    }
  }
  getParticularSlides(getData:any) {
    var that = this;
    const bList = that.dataService.GetPresentationSlides(getData).pipe(first()).subscribe((slides: any) => {
      if (slides[0] != "Failed") {
        var filterSlides = slides;
        this.sharedData.GetDefaultPresentationdata.next(filterSlides);
        var parentWidth = window.innerWidth;
        if (parentWidth >= 1250) {
          if (parentWidth >= 1600) {
            //console.log(that.slides.length);
            if (parentWidth >= 1900 && filterSlides.length > 7) {
              that.topMenuSlidetoShow = 8;
              that.topMenuSlidetoShowWidth = '32rem';
            } else {
              if (filterSlides.length > 3) {
                that.topMenuSlidetoShow = 7;
                that.topMenuSlidetoShowWidth = '28rem';
              } else {
                that.topMenuSlidetoShow = 3;
                that.topMenuSlidetoShowWidth = '12rem';
              }
            }
          } else {
            if (filterSlides.length > 3) {
              that.topMenuSlidetoShow = 5;
              that.topMenuSlidetoShowWidth = '20rem';
            } else {
              that.topMenuSlidetoShow = 3;
              that.topMenuSlidetoShowWidth = '12rem';
            }

          }
        } else {
          that.topMenuSlidetoShow = 3;
          that.topMenuSlidetoShowWidth = '12rem';
        }
        //if (window.innerWidth >= 1300) { that.topMenuSlidetoShow = 5; } else { that.topMenuSlidetoShow = 3; }

        if (filterSlides.length > 0) {
          that.slides = filterSlides;
          that.slides_Modal = filterSlides;
          that.slideConfig = {
            lazyLoad: 'ondemand',
            infinite: false,
            centerMode:false,
            slidesToScroll: 1,
            slidesToShow: that.topMenuSlidetoShow,
            dots: false,
            autoplay: false,
            autoplaySpeed: 2000
          };
          setTimeout(() => {
            setTimeout(() => { that.isLoadedPPTSlides = true; }, 1000);
            that.showtoNavSlides = false;
            if (this.showSliderPmode) {
              const dockElement: any = document.getElementById("showPPTIcon");
              gsap.to(dockElement, { scale: 1, opacity: 1, ease: "ease.out" })
            }
            //console.log(that.showtoNavSlides, this.sharedData.checkShowLeftTab(2032), this.sharedData.checkMenuPer(2032, 2264))
            that.slickModal.unslick(); // Uninitialize slick slider
            that.slickModal.initSlick(); // Reinitialize slick slider
          }, 200);
        } else { this.slides = []; this.sharedData.GetDefaultPresentationdata.next([]); }
      }
    }, error => { this.slides = []; this.sharedData.GetDefaultPresentationdata.next([]); });
  }
 
  getSafeUrl(url: string): SafeResourceUrl {
    //console.log(url);
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    //return url;
  }
  sanitizeUrl(url: string): string {
    const allowedSchemes = ['http:', 'https:'];
    try {
      const parsedUrl = new URL(url);
      if (allowedSchemes.includes(parsedUrl.protocol)) {
        return url;
      }
    } catch {
      console.error('Unsafe or invalid URL:', url);
    }
    return '';
  }
  getPPTSlides() {
    var that = this;
    var GetPresentationdata = this.dataService.GetPresentationdata().pipe(first()).subscribe((res: any) => {
    
      that.sharedData.GetAllPresentationdata.next(res);
      //that.sharedData.showCircleLoader.next(false);
    },
      (error: any) => {
        that.sharedData.GetAllPresentationdata.next([]);
        // this.logger.logError(error, 'GetStgyListDashboard');
        // that.sharedData.showCircleLoader.next(false);
      });
    that.subscriptions.add(GetPresentationdata);

      var GetPresentationtickers = this.dataService.GetPresentationTickers().pipe(first()).subscribe((res: any) => {
     
      that.sharedData.GetAllPresentationtickers.next(res);
    },
      (error: any) => {
        that.sharedData.GetAllPresentationtickers.next([]);
      });
    that.subscriptions.add(GetPresentationtickers);
    
  }

 
  currentSlideIndex:any = null;
  slideConfigModal = {
    infinite: false,
    slidesToScroll: 1,
    slidesToShow: 1,
    nextArrow: '<button type="button" class="slick-next"><span class="material-icons">chevron_right</span></button>',
    prevArrow: '<button type="button" class="slick-prev"><span class="material-icons">chevron_left</span></button>',
    centerPadding: '5px',
    dots: true,
    autoplay: false,
    autoplaySpeed: 2000
  };


  ngAfterViewInit() {
    
  }

  afterChange(e: any) {
    this.isPPTModalOpenIndex = e.currentSlide;
  }
  slickInit(e: any) {
    
    /*console.log('slickInit', e);*/
    //console.log('slick initialized');
  }
  slickInitModal(e: any) {
    this.cdr.detectChanges(); 
  }
  beforeChange(e: any) {
    this.isPPTModalOpenIndex = e.currentSlide;
  }
  ppt_DotsHover() {
    var that = this;
    const dots = document.querySelectorAll('#livePPT .slick-dots li');
    dots.forEach((dot, index) => {
      dot.addEventListener('mouseover', () => {
        const imageSrc = this.slides_Modal[index].slideImage;
        that.pptHoverImage = imageSrc;
        //console.log(imageSrc);
      });
      dot.addEventListener('mouseleave', () => {
        that.pptHoverImage = '';
        //console.log('leave');
      });
    });
  }
  closeMainPPTModal() {
    var that = this;
    this.isPPTModalMinimize = true;
    setTimeout(() => {
      if (that.slickModal) {
        that.currentSlideIndex = that.isPPTModalOpenIndex;
        var totalSLides = that.slides.length - that.isPPTModalOpenIndex;
        var targetIndex = that.slides.length - that.topMenuSlidetoShow;
        if (that.topMenuSlidetoShow >= totalSLides) {
          that.slickModal.slickGoTo(targetIndex);
        } else { that.slickModal.slickGoTo(that.currentSlideIndex); }
        // Convert the string index to a number
        
      }
    }, 100);
  }
  onIframeLoad() {
    var that = this;
    that.iframeDomLoaded = false;
    that.showSpinnerSlides = false;
  }
  iframeDomLoaded: boolean = true;
  openlivePPT(ind: any) {
    var that = this;
    /*that.slides_Modal = [...that.slides];*/
    
    that.isPPTModalOpen = true;
    that.showSpinnerSlides = true;
   /* that.iframeDomLoaded = true;*/
    that.isPPTModalOpenIndex = ind;
    $('#livePPT').modal('show');
      setTimeout(() => {
        //that.slickModalPPT.unslick(); // Uninitialize slick slider
        //that.slickModalPPT.initSlick(); // Reinitialize slick slider
        that.slickModalPPT.slickGoTo(ind);
        that.ppt_DotsHover();
        setTimeout(() => {
          if (this.iframe) {
            this.iframe.nativeElement.onload = () => {
              that.iframeDomLoaded = false;
              that.showSpinnerSlides = false;
            };
          }
        }, 0);
      }, 100);
    setTimeout(() => { that.showSpinnerSlides = false; }, 1000);
    var slidername = parseInt(ind + 1) + ' Slider';
    this.sharedData.userEventTrack('Drag PPT', 'PPT Slider', slidername, 'Slider Click')
  }
  openExistPPT() {
    var that = this;
   /* that.slides_Modal = [...that.slides];*/
    that.isPPTModalOpen = true;
    that.showSpinnerSlides = true;
    /*that.iframeDomLoaded = true;*/
    $('#livePPT').modal('show');
   
    setTimeout(() => {
      //that.slickModalPPT.unslick(); // Uninitialize slick slider
      //that.slickModalPPT.initSlick(); // Reinitialize slick slider
      if (that.isPPTModalOpenIndex > 0) {
        that.slickModalPPT.slickGoTo(that.isPPTModalOpenIndex);
        that.ppt_DotsHover();
      } else {
        that.slickModalPPT.slickGoTo(this.currentSlideIndex);
        that.ppt_DotsHover();
      }
      setTimeout(() => {
        if (this.iframe) {
          this.iframe.nativeElement.onload = () => {
            that.iframeDomLoaded = false;
            that.showSpinnerSlides = false;
          };
        }
      }, 0);
    }, 100);
    setTimeout(() => { that.showSpinnerSlides = false; }, 1000);
  }
  pptHoverImage: string = "";
  onMouseEnterPPT(e:any, imgsrc:any) {
    this.pptHoverImage = imgsrc;
  }
  onMouseLeavePPT(e: any) {
    this.pptHoverImage = "";
  }
  PPTModalGoHome() {
    this.slickModalPPT.slickGoTo(0);
    this.slickModal.slickGoTo(0);
    this.isPPTModalOpenIndex = 0;
    this.currentSlideIndex = 0;
    this.isPPTModalMinimize = false;
    this.isVideoPlaying = false
  }
  openRebalanceAlert() {
    var title = 'Upcoming rebalance accounts';
    var options = { from: 'authentication', error: 'notifyError', destination: 'close' }
    var clickeddata: any = this.sharedData._getRebalancesPopupData;
    this.dialog.open(RebalanceNavComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata, dialogSource: options } });
    this.sharedData.userEventTrack('Header Nav', "Rebalance", 'nav Rebalance', 'open Rebalance Click');
  }
  getRebalancesData: any=[];
  getRebalanceCount = { Next: 0, Prev: 0, Current: 0 };
  getRebalances(data:any) {
    //let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    //const sList = this.dataService.GetUpcomingRebalances().pipe(first())
    //  .subscribe(data => {    
    if (isNotNullOrUndefined(data) && data.length > 0) {
      this.getRebalancesData = data;
          var Next_Reb = this.getRebalancesData.filter((x:any) => x.flag == "N");
          var Prev_Reb = this.getRebalancesData.filter((x: any) => x.flag == "P");
          var Current_Reb = this.getRebalancesData.filter((x: any) => x.flag == "C");
          this.getRebalanceCount['Next'] = Next_Reb.length;
          this.getRebalanceCount['Prev'] = Prev_Reb.length;
          this.getRebalanceCount['Current'] = Current_Reb.length;
        }
      //}, error => {
      //  this.getRebalancesData = [];
      //  this.getRebalanceCount['Next'] = 0;
      //  this.getRebalanceCount['Prev'] = 0;
      //  this.getRebalanceCount['Current'] = 0;
      //});
  }
  rebalClass(d:any) {
    var that = this;
    var checkReb = that.getRebalancesData.filter((x: any) => x.strategyId == d.id);
    if (checkReb.length > 0) {
      if (checkReb[0]['flag'] == "N") { return 'upcomingRebalnce_span'; }
      else if (checkReb[0]['flag'] == "C") { return 'currentRebalnce_span'; }
      else if (checkReb[0]['flag'] == "P") { return 'prevRebalnce_span'; }
      else { return 'active' }
    } else { return 'active' }
  }
  fillPreference() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    that.userService.getUserSettings(userid).pipe(first()).subscribe((userdata: any) => {
      if (Object.keys(userdata).length > 0) {
       
        that.sharedData.userPrefData.next(userdata);
        that.assignPreferenceData(userdata[0]);
      }
    });
  }
  showSliderPmode: boolean = false;
  openPresentation(d: string) {
    var that = this;
   
    if (d == 'Y') {
      $('body').addClass('P_mode');
      that.showSliderPmode = true;
      that.showtoNavSlides = false;
      //that.isHidePPT();
    } else {
      $('body').removeClass('P_mode');
      that.showtoNavSlides = false;
      that.showSliderPmode = false;
    }
  }
  openThemeColor(val:string) {
    var $body = $('body, html');
    $body.removeClass('C_layout_1');
    $body.removeClass('C_layout_2');
    $body.removeClass('C_layout_3');
    $body.removeClass('C_layout_4');
    if (val == 'A') {
      $body.addClass('C_layout_4');
    }
    else if (val == 'B') {
      $body.addClass('C_layout_2');
    }
    else if (val == 'C') {
      $body.addClass('C_layout_3');
    }
    else {
      $body.addClass('C_layout_1');
    }
  }
  opeFontSize(val: number) {
    var $body = $('body, html');
    //this.app_slider_value = val;
    if (val == 14) {
      $body.removeClass('fs--15');
      $body.removeClass('fs--16');
      $body.removeClass('fs--17');
      $body.removeClass('fs--18');
      $body.removeClass('fs--19');
      $body.addClass('fs--14');
    }
    else if (val == 15) {
      $body.removeClass('fs--14');
      $body.removeClass('fs--16');
      $body.removeClass('fs--17');
      $body.removeClass('fs--18');
      $body.removeClass('fs--19');
      $body.addClass('fs--15');
    }
    else if (val == 16) {
      $body.removeClass('fs--14');
      $body.removeClass('fs--15');
      $body.removeClass('fs--17');
      $body.removeClass('fs--18');
      $body.removeClass('fs--19');
      $body.addClass('fs--16');
    }
    else if (val == 17) {
      $body.removeClass('fs--14');
      $body.removeClass('fs--15');
      $body.removeClass('fs--16');
      $body.removeClass('fs--18');
      $body.removeClass('fs--19');
      $body.addClass('fs--17');
    }
    else if (val == 18) {
      $body.removeClass('fs--14');
      $body.removeClass('fs--15');
      $body.removeClass('fs--16');
      $body.removeClass('fs--17');
      $body.removeClass('fs--19');
      $body.addClass('fs--18');
    }
    else if (val == 19) {
      $body.removeClass('fs--14');
      $body.removeClass('fs--15');
      $body.removeClass('fs--16');
      $body.removeClass('fs--17');
      $body.removeClass('fs--18');
      $body.addClass('fs--19');
    } else {
      $body.removeClass('fs--14');
      $body.removeClass('fs--15');
      $body.removeClass('fs--17');
      $body.removeClass('fs--18');
      $body.removeClass('fs--19');
      $body.addClass('fs--16');
    }
  }
  assignPreferenceData(data: any) {
    this.sharedData.getPresentationMode.next(data['presentMode']);
    this.sharedData.getThemeColorMode.next(data['apperanceMode']);
    if (isNullOrUndefined(data['fontSize'])) {
      this.sharedData.getFontSettings.next(16);
    } else { this.sharedData.getFontSettings.next(data['fontSize']); }
    
    if (isNotNullOrUndefined(data['dataMode']) && data['dataMode'] == "L") {
      this.Change_header_LD = "live";
      //this.Change_header_Env = false;
      this.showLiveDemoToggle = true;
    } else {
      this.Change_header_LD = "demo";
      //this.Change_header_Env = true;
      this.showLiveDemoToggle = true;
    }

    if (isNotNullOrUndefined(data['leftGridOn']) && data['leftGridOn'] == "Y") {
      this.sharedData.getSelectedLeftSide.next('Y');
      this.sharedData.openPinnedLeftSide.next(true);
    } else {
      this.sharedData.getSelectedLeftSide.next('N');
      this.sharedData.openPinnedLeftSide.next(false);
    }

    if (isNotNullOrUndefined(data['rightGridOn']) && data['rightGridOn'] == "Y") {
      this.sharedData.getSelectedRightSide.next('Y');
      this.sharedData.openPinnedRightSide.next(true);
    } else {
      this.sharedData.getSelectedRightSide.next('N');
      this.sharedData.openPinnedRightSide.next(false);
    }

  }
  savePinnedPreference() {

    var that = this;
    let objdtls: UserSettings;
    objdtls = new UserSettings();
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    objdtls.userId = userid;

    if (that.sharedData._openPinnedLeftSide == true) objdtls.leftGridOn = 'Y';
    else objdtls.leftGridOn = 'N';
    if (that.sharedData._openPinnedRightSide == true) objdtls.rightGridOn = 'Y';
    else objdtls.rightGridOn = 'N';
    if (that.Change_header_LD == 'live' ) objdtls.dataMode = 'L';
    else objdtls.dataMode = 'D';

    objdtls.presentMode = this.sharedData._getPresentationMode;
    objdtls.defAccountValue = 0;
    objdtls.fontSize = this.sharedData._getFontSettings;
    objdtls.apperanceMode = this.sharedData._getThemeColorMode;

   
    var userdata: any = this.sharedData.userPrefData.getValue();
    if ((isNotNullOrUndefined(userdata) && userdata[0].leftGridOn != objdtls.leftGridOn) || (isNotNullOrUndefined(userdata) && userdata[0].rightGridOn != objdtls.rightGridOn)) {
    
      that.userService.updateUserSettings(objdtls).pipe(first()).subscribe(data => {
     
        that.userService.getUserSettings(userid).pipe(first()).subscribe((userdata: any) => {
          if (Object.keys(userdata).length > 0) {
            that.sharedData.userPrefData.next(userdata);
            //that.assignPreferenceData(userdata[0]);
          }
        });
      }, error => { });
    }
  
  }
  checkGlobalSearch(){
    if(window.location.pathname.indexOf('home') !== -1){return true;}else{return true;}
    }
  openUniverseMenu() {
    if (window.location.pathname.indexOf('customIndexing') > -1 && this.cusIndexService.checkStrModify()) {
      $('#saveTempAlert').modal('show');
      this.sharedData.saveChangePlace = 'openUniverseMenu';
    } else {
      this.router.navigate(['/home']);
      this.sharedData.openUniverseMenu.next(true);
    }
    this.sharedData.showDefaultSideGrids.next(true);
    /*reset PPT ticker*/
    this.resetPPTSlidesTicker();
    /*reset PPT ticker*/
    this.sharedData.userEventTrack('Header Nav', "Dashboard Home", 'Home', 'View Home Click');
  }
  goToHelpLink(url: string) {
    window.open(url, "_blank");
    this.sharedData.userEventTrack('Header Nav', "Help Link", 'nav Help Link', 'open Help Link Click');
  }
  openUniverseMenuClose() {
    if (window.location.pathname.indexOf('customIndexing') > -1 && this.cusIndexService.checkStrModify()) {
      $('#saveTempAlert').modal('show');
      this.sharedData.saveChangePlace = 'openUniverseMenu';
    } else {
      this.router.navigate(['/home']);
      this.sharedData.openUniverseMenu.next(false);
      this.sharedData.rouletCircleHomeClick.next(true);
    }
    this.sharedData.showDefaultSideGrids.next(true);
    /*reset PPT ticker*/
    this.resetPPTSlidesTicker();
    /*reset PPT ticker*/
    this.sharedData.userEventTrack('Header Nav', "Dashboard Home", 'Home', 'View Home Click');
  }
  resetPPTSlidesTicker() {
    //this.sharedData.showDefaultSideGrids.next(false);
    this.sharedData.showNavPPT_Ticker.next('');
  }
  Change_header_Environment(x: string) {
   
    if (x == 'live') {
     // this.Change_header_Env = false;
      //this.Change_header_LD = 'live';
      var title = 'live';
      var clickeddata: any = [];
      this.dialog.open(DialogNavComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata } });

    }
    else {
      //this.Change_header_Env = true;
      //this.Change_header_LD = 'demo';
      var title = 'demo';
      var clickeddata: any = [];
      this.dialog.open(DialogNavComponent, { width: "35%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata } });

    }
    //$(".livedemoDrop li a").click(function () {
    //  $(".livedemoDrop").removeClass("show");
    //});
    //this.savePreference();
    this.sharedData.userEventTrack('Header Nav', "Change header Environment", x, 'Change Environment Click');
  }

  async logOut() {
    try {
      let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
      let remToken = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).remToken)));
      this.authenticationService.updateUserTrackLogOut(userid, remToken);
    } catch (e) { }
    if (await this.oktaAuth.isAuthenticated()) { this.logoktauserout(); }
    this.authenticationService.forceLogout();
    this.sharedData.userEventTrack('Header Nav', "Log out", 'nav Log out', 'Log out Click');
  }

  async logoktauserout() { this.oktaAuth.tokenManager.clear(); }

  usname() {
    //const name: string = 'currentUser';
    var currentUser = JSON.parse(sessionStorage['currentUser']);
    if (isNotNullOrUndefined(currentUser)) { return atob(atob(atob(currentUser.username))); } else { return ""; }
  };
  remOkta() {
    var data = { "id": this.selOkta.Id };
    this.dataService.RemoveCompanySSO(data).pipe(first()).subscribe(res => {
      this.selOkta = undefined;
      this.toastr.success('Company Okta settings removed successfully ', '', { timeOut: 5000 });
      this.getcompaniesSSO();
    });
  }
 
  openCompanySettings() {
    var that = this;
    this.getcompaniesSSO();
    this.showSpinnerAcc_loaded = true;
    this.oktaEdit = true;
    $('#SSOModal').modal('show');
    this.sharedData.userEventTrack('Header Nav', "Company Settings", 'nav Company Settings', 'open Company Settings Click');
  }
  openAccounts(){
    this.sharedData.show_funded.next(false)
    this.router.navigate(['/account']);
  }
  getcompaniesSSO() {
    var that = this;
    let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
    this.dataService.GetCompanySSO().pipe(first()).subscribe(res => {
      that.companies = res;
      this.tabcompanies = that.companies;
      var data = that.companies.filter((x: any) => x.UserId == userid);
      try {
      if (this.tabcompanies.length > 0) {
       
            setTimeout(() => {  this.oktaEdit = !this.oktaEdit; }, 200)
        
        this.clientId = data[0].ClientId;
        this.companyName = data[0].Company;
        this.issuer = data[0].Issuer;
        // setTimeout(() => { that.showSpinnerAcc_loaded = false; }, 1000)
      } else {
       
        this.clientId = "";
        this.companyName = "";
        this.issuer = "";
        this.oktaEdit = true;
        // setTimeout(() => { that.showSpinnerAcc_loaded = false; }, 1000)
        }
      } catch (e) { console.log(e) }
      setTimeout(() => { that.showSpinnerAcc_loaded = false; }, 500);
    });
  }

  editOkta(d:any) {
    this.oktaEdit = true;
    this.selOkta = d;
    this.clientId = d.ClientId;
    this.companyName = d.Company;
    this.issuer = d.Issuer;
  }

  savecompanies() {
    var that = this;
    var data:any = [];
    this.companyName = this.companyName.trim();
    this.issuer = this.issuer.trim();
    this.clientId = this.clientId.trim();
    if (this.oktaFormGroup.valid && this.companyName != '' && isNotNullOrUndefined(this.companyName) && this.issuer != '' && isNotNullOrUndefined(this.issuer) && this.clientId != '' && isNotNullOrUndefined(this.clientId)) {
      this.dataService.FindCompanySSO(this.companyName).pipe(first()).subscribe((res: any) => {
        var checkComp = true;
        if (isNotNullOrUndefined(this.selOkta) && isNotNullOrUndefined(this.selOkta.Id) && res.length > 0) {
          if (res.filter((x:any) => x.Id == this.selOkta.Id).length > 0) { checkComp = false; }
        } else if (res.length > 0) { checkComp = true; } else { checkComp = false; };
        if (res.length > 0 && checkComp) {
          var txt = this.companyName + " is already available";
          this.toastr.success(txt, '', { timeOut: 5000 });
        } else {
          let userid = atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId)));
          var objdtls = {
            "company": this.companyName,
            "issuer": this.issuer,
            "clientId": this.clientId,
            "userid": parseInt(userid)
          };
          data.push(objdtls);
          $(document.body).removeClass('modal-open');
          $('.modal-backdrop').remove();
          that.dataService.updateOktaSettings(data).pipe(first()).subscribe((data:any) => {
              this.toastr.success('Company Okta settings saved successfully ', '', { timeOut: 5000 });
              this.oktaEdit = true;
              this.getcompaniesSSO();
            }, (error:any) => { });
        }
      });
    }
  }

  checkPpecialChar(event:any) {
    var k;
    k = event.charCode;
    return ((k > 64 && k < 91) || (k > 96 && k < 123) || k == 8 || k == 32 || (k >= 48 && k <= 57));
  }

  onPaste(event: ClipboardEvent) {
    try {
      let regexp = new RegExp('[^-_().;:,!a-zA-Z0-9/ ]');
      let clipboardData:any = event.clipboardData;
      let pastedText = clipboardData.getData('text');
      let test = regexp.test(pastedText);
      if (test) { event.preventDefault(); };
    } catch (e) {
    }
  }

  checkerror(value:any) { if (value == "" || isNullOrUndefined(value)) { return true } else { return false; } }
  checkiserror() { if (this.oktaFormGroup.controls['issuer'].valid) { return true } else { return false; } }

  closeCompany() {
    $('#SSOModal').modal('hide');
    $(document.body).removeClass('modal-open');
    $('.modal-backdrop').remove();
  }

  checkref() {
    var iss = JSON.parse(sessionStorage['currentUser']).issuer;
    if (iss == undefined) iss = sessionStorage.getItem("issuer");
    var uniqueId = JSON.parse(sessionStorage['currentUser']).uniqueId;
    if (uniqueId == undefined) uniqueId = sessionStorage.getItem("uniqueId");
    var username = JSON.parse(sessionStorage['currentUser']).username;
    if (isNullOrUndefined(iss)) { iss = '' } else {
      iss = '?iss=' + iss
      if (uniqueId != '') { iss += '&uid=' + uniqueId };
      if (username != '') { iss += '&un=' + username };
    };

    if (window.location.href.indexOf("https://space.buildyourindex.com") > -1) {
      const url =  "https://admin.buildyourindex.com/login/" + iss;
      window.open(url, '_blank');
    }
    else {
      const url = "https://demo-admin.buildyourindex.com/login/" + iss;
      window.open(url, '_blank');
    }
    this.sharedData.userEventTrack('Header Nav', "Control Panel", 'nav Control Panel', 'open Control Panel Click');
  }
  Disclosures() {
    if (window.location.href.indexOf("https://space.buildyourindex.com") > -1) {
      return "https://www.newagealpha.com/disclaimers"
    }
    else {
      return "https://demo-alpha7.newagealpha.com/disclaimers"
    }
  }
  showNotify: boolean = false;
  showTradeNotify: boolean = false;
  showWatchlist: boolean = false;
  toggleNotifications() {
    // console.log(this.showNotify,'this.showNotify')
    this.showNotify = !this.showNotify;
    this.sharedData.openNotification.next(this.showNotify);
  
    $('#indexRulesModal').modal('hide');
    if (this.sharedData._openTradeNotification == true) { this.sharedData.openTradeNotification.next(false); };
    if (this.sharedData._openWatchlist == true) { this.sharedData.openWatchlist.next(false); };
    this.sharedData.userEventTrack('Header Nav', "toggle Notifications", 'nav Notifications', 'toggle Notifications Click');
  }
  openWatchlist(){
    this.showWatchlist = true;
    this.sharedData.openWatchlist.next(this.showWatchlist)
    this.sharedData.userEventTrack('Header Nav', "WatchList", 'nav WatchList', 'open WatchList Click');
  }
  toggleTradeNotifications() {
    this.showTradeNotify = !this.showTradeNotify;
    this.sharedData.openTradeNotification.next(this.showTradeNotify);
    $('#indexRulesModal').modal('hide');
    if (this.sharedData._openNotification == true) { this.sharedData.openNotification.next(false); };
    if (this.sharedData._openWatchlist== true) { this.sharedData.openWatchlist.next(false); };
  }

  checkcircle_badge() {
    var that = this;
    var data = that.sharedData._getNotificationQueue;
    var data1 = data.filter((x: any) => x.displayQueue != 'N');
    var dataH = that.sharedData._getHNotificationQueue;
    var dataH1 = dataH.filter((x: any) => x.displayQueue != 'N');
    if (dataH1.length > 0) {
      var checkdot = dataH1.filter((x: any) => x.notifyStatus != 'E');
      if (checkdot.length > 0) { return true; } else { return false; }
    } else if (data1.length > 0) {
      var checkdot = data1.filter((x: any) => x.notifyStatus != 'E');
      if (checkdot.length > 0) { return true; } else { return false; }
    } else { return false; }
  }

  openAppearance() {
    var title = 'Preferences';
    var clickeddata: any = [];
    this.dialog.open(DialogNavComponent, { width: "40%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata } });
    this.sharedData.userEventTrack('Header Nav', "Preferences", 'nav Preferences', 'open Notifications Click');
  }

  openPresentationSettings() {
    //apperance_ModalOpen() {
    var title = 'Presentation';
    var clickeddata: any = [];
    this.dialog.open(DialogNavComponent, { width: "30%", height: "auto", maxWidth: "100%", maxHeight: "90vh", data: { dialogTitle: title, dialogData: clickeddata } });
    //}
    //$('#myAppearanceModal').modal('show');
    this.sharedData.userEventTrack('Header Nav', "Presentation", 'nav Presentation', 'open Presentation Click');
  }
  openPPT_Slides() {
   
    var title = 'Select PPT Slides';
    var clickeddata: any = [];
    this.dialog.open(DialogNavComponent, { width: "60%", height: "auto", maxWidth: "100%", maxHeight: "90vh", panelClass: "presentationExpand", data: { dialogTitle: title, dialogData: clickeddata } });
    
  }
  //OpenPRModal(title:any,isdynamic:any){
  //  var PRTitle = title;
  //  if(isdynamic == 'dynamic'){
  //    var PRTitleDynamic = title.name.replaceAll(" ", "-");
  //  }
  //  const dialogData = new DialogModel(PRTitle,PRTitleDynamic);
  //  this.dialog.open(PresentationDialogComponent, {
  //    width: "95vw", height: "90vh", maxWidth: "100%", maxHeight: "90vh", data: dialogData,
  //    panelClass: "presentationBg"
  //  });
  //}
  openPreference() {

    $('#preModal').modal('show');
    try {
      if (d3.selectAll('#STW_PriceRefresh').style('display') != 'none') { d3.select('#STW_PriceRefresh').dispatch('click'); }
    } catch (e) {
      //console.log(e)
    }
    //this.fillPreference();
  }
  closePreference() {
    //try { this.assignPreferenceData(this.sharedData._userPrefData[0]); } catch (e) {
    //  //console.log(e)
    //}
    if ($('.LeftFilterList').length > 0) { $(".LeftFilterList").removeClass("LeftFilterList"); }
    $('#preModal').modal('hide');
    $(document.body).removeClass('modal-open');
    $('.modal-backdrop').remove();
  }
  openFeedbackModel() {
    //this.hideConsult();
    this.dialog.open(FeedbackComponent, { width: "56vw", maxWidth: "90vw", maxHeight: "90vh", panelClass: 'feedback-modalbox', });
    this.sharedData.userEventTrack('Header Nav', "Feedback", 'nav Feedback', 'open Feedback Click');
  }
  OpenLCModal(data1:any) {
    // console.log(data1);
    //if (data == 'Source of Alpha') {
    //  this.dialogCtrl.s_a_losers_modal(s_a_losers_modalComponent);
    //}
    //else if (data.name == 'Factor and Fund Performance') {
    //  this.dialogCtrl.s_h_fund_modal(s_h_fund_modalComponent);
    //}
    //else if (data == 'What is a loser') {
    //  this.dialogCtrl.w_i_loser_modal(w_i_loser_modalComponent);
    //}
    //else if (data.name == 'Source of return' || data.name == 'Source of return ') {
    //  this.dialogCtrl.s_o_return_modal(s_o_return_modalComponent);
    //}
    //else if (data.name == 'Distribution Process' || data.name == 'Distribution Process ') {
    //  this.dialogCtrl.s_o_return_modal(dis_process_modalComponent);
    //}
    //else if (data == 'Where alpha comes') {
    //  this.dialogCtrl.w_alpha_modal(w_alpha_modalComponent);
    //}
    //else if (data == 'Discounted cash flow') {
    //  this.dialogCtrl.d_cash_modal(d_cash_modalComponent);
    //}
    //else if (data == 'ERF Calculation') {
    //  this.dialogCtrl.d_cash_modal(erf_calculation_modalComponent);
    //}
    //else if (data == 'tesla') {
    //  this.dialogCtrl.tesla_index_modal(tesla_modalComponent);
    //}
    //else if (data == 'fixed-income') {
    //  this.dialogCtrl.fixed_income_modal(fixedincome_modalComponent);
    //}
    //else if (data == 'w-space') {
    //  this.dialogCtrl.w_space_modal(w_space_modalComponent);
    //}
    //else if (data == 'i-space') {
    //  this.dialogCtrl.i_space_modal(i_space_modalComponent);
    //}
    //else if (data == 'b-index') {
    //  this.dialogCtrl.b_index_modal(b_index_modalComponent);
    //}
    //else if (data == 'benefits-space') {
    //  this.dialogCtrl.benefits_index_modal(benefits_space_modalComponent);
    //}
    //else {
    //  this.dialogCtrl.openImpliedRevenueT(ImpliedRevenueTComponent);
    //}
  }
  //showFullscreen: boolean =  true;
  //openFullScreen(): void {
  //  const elem = document.documentElement; // You can replace document.documentElement with any specific element you want to make fullscreen
  //  this.showFullscreen = false;
  //  if (elem.requestFullscreen) {
  //    elem.requestFullscreen();
  //  } else if ((elem as any).mozRequestFullScreen) { /* Firefox */
  //    (elem as any).mozRequestFullScreen();
  //  } else if ((elem as any).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
  //    (elem as any).webkitRequestFullscreen();
  //  } else if ((elem as any).msRequestFullscreen) { /* IE/Edge */
  //    (elem as any).msRequestFullscreen();
  //  }
  //}
  fullscreen_icon: boolean = true;
  toggleFullscreen() {
    this.fullscreen_icon = !this.fullscreen_icon;
    const elem = document.documentElement; // You can replace document.documentElement with any specific element you want to make fullscreen
    if (!this.fullscreen_icon) {
      $('#fullScreens').addClass('fullsizeScreen');
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) { /* Firefox */
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).webkitRequestFullscreen) { /* Chrome, Safari and Opera */
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) { /* IE/Edge */
        (elem as any).msRequestFullscreen();
      }
    } else {
      $('#fullScreens').removeClass('fullsizeScreen');
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).mozCancelFullScreen) { /* Firefox */
        (document as any).mozCancelFullScreen();
      } else if ((document as any).webkitExitFullscreen) { /* Chrome, Safari and Opera */
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) { /* IE/Edge */
        (document as any).msExitFullscreen();
      }
    }
    this.sharedData.userEventTrack('Header Nav', "toggle Fullscreen", 'nav toggle Fullscreen', 'toggle Fullscreen Click');
  }


  viewTicker(ticker: string) {
    //ticker = 'AAPL';
    var that = this;
    that.sharedData.showMatLoader.next(true);
    //setTimeout(() => {
      
    that.gloSrcService.keySearch(ticker);
      $('#livePPT').modal('hide');
      var defaultSlide = that.isPPTModalOpenIndex;
    this.equityService.selComp.next(undefined);
    that.sharedData.showDefaultSideGrids.next(true);
      that.sharedData.showNavPPT_Ticker.next(ticker);
      setTimeout(() => { that.isPPTModalOpenIndex = defaultSlide }, 200);
  
    this.sharedData.userEventTrack('Drag PPT Modal', 'PPT Slider', ticker, 'Slider Ticker Click')
  }
}
export const tabAnimation = trigger('tabAnimation', [
  transition(':enter', [
    style({ transform: 'translateX(-100%)' }),
    animate('500ms ease-out', style({ transform: 'translateX(0%)' }))
  ]),
  transition(':leave', [
    animate('500ms ease-out', style({ transform: 'translateX(100%)' }))
  ])
]);

export function noDoubleSpaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value || '';
    const hasDoubleSpace = /\s{2,}/.test(value);
    return hasDoubleSpace ? { doubleSpace: true } : null;
  };
}
