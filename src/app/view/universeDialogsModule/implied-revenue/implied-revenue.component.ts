import { Component, Inject, OnDestroy, OnInit ,AfterViewInit} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { isNotNullOrUndefined, isNullOrUndefined } from '../../../core/services/sharedData/shared-data.service';
import { DataService } from '../../../core/services/data/data.service';
import { format } from 'd3';
import { DatePipe, formatDate } from '@angular/common';
import * as d3 from 'd3';
import { Subscription, first } from 'rxjs';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';
import Drilldown from 'highcharts/modules/drilldown';
declare const gsap: any;
@Component({
  selector: 'app-implied-revenue',
  templateUrl: './implied-revenue.component.html',
  styleUrl: './implied-revenue.component.scss'
})
export class ImpliedRevenueComponent implements OnInit, OnDestroy ,AfterViewInit{
  stockPrice: any = "";
  HistIG: any = 0;
  impRevValue: any = 0;
  selpopSC: number = 0;
  mostLike_value: any = "";
  leastLike_value: any = "";
  selComp: any;
  formattedDate: any;
  pipe = new DatePipe('en-US');
  companyName: any;
  ticker: string='';
  companyC: any;
  companyCDate: any;
  compName:any;
  Tabname1: string = 'IGR';
  Tabname2: string = 'h-factor GME';
  subscriptions = new Subscription();
  cl: any = d3.scaleLinear<any>().domain([0, 25, 50, 75, 100]).range(["#40b55c", "#75c254", "#f5ea23", "#f37130", "#ef462f"]);
  constructor(public dataService: DataService, @Inject(MAT_DIALOG_DATA) public modalData: any, private dialogref: MatDialogRef<ImpliedRevenueComponent>) { this.showSpinnerPPT_loaded = true; }
  showPPTButton: boolean = false;
  isVisible: boolean = false;
  CS_latest:any={
    "TradeDate": "",
    "StockKey": null,
    "HistIG": null,
    "Scores": null,
    "Price": null,
    "ImpliedRevenue": null,
    "HistMean": null
}
  ngOnInit() {
    var that = this;
    that.showSpinnerPPT_loaded = true;
    setTimeout(() => { 
    that.selComp = that.modalData.dialogSource['selComp'];
    that.companyName = that.selComp['companyName']
    that.ticker = (isNotNullOrUndefined(that.selComp['ticker'])) ? that.selComp['ticker'] : '';
    that.showPPTButton = that.modalData.dialogSource['showPPTComparison'];
    that.loadData();
      if (that.showPPTButton && that.ticker == 'GME') { that.toggle('gme'); }
      else if (that.ticker == 'TSLA') {
        that.activeTab = 'igr';
        this.isVisible = true;
        this.isOpenTesla = false; that.showSpinnerPPT_loaded = false;
       }
      else { that.showSpinnerPPT_loaded = false; }

    }, 20)
   
    setTimeout(() => {
      d3.select('#tab-3').style('opacity', 0);
      d3.select('#tab-2').style('opacity', 0);
      d3.select('#tab-1').style('opacity', 0);
    }, 10);
    setTimeout(() => {
      d3.select('#tab-3').style('opacity', 0);
      d3.select('#tab-2').style('opacity', 0);
      d3.select('#tab-1').style('opacity', 0);
      this.stepOneClick();
    }, 1000);
    
  }
  step1Arc:any;
  step1ArcReverse:any;
  step1ArcStart:any;
  step3Arc:any
  ngAfterViewInit(){
    (window as any).gsap.registerPlugin((window as any).ScrollTrigger, (window as any).MorphSVGPlugin);
 
    this.step1Arc = gsap.timeline();
    this.step1ArcReverse = gsap.timeline();
    this.step1ArcStart = gsap.timeline();
  
    this.step1ArcStart.to(".step1Move", { transform: "translateX(-330px)", duration: 0.5, scale: 1, }, "arc1")
      .to(".step2Move", { transform: "translateX(500px)",  duration: 0.25, }, "arc1")
    this.step1ArcStart.pause();
   
      //this.step1Arc
      //  .fromTo("#Mask_2", { x: 0 }, { x: 550, duration: 1.5, delay: 1, ease: "ease.in" }, "arc1")
      //  .fromTo("#text2", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "arc1+0.08")
      //  .fromTo("#text2M", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "arc1+0.08")
      //  .fromTo("#text2L", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "arc1+0.08")
      //  .fromTo("#ArrowNipImg1", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "arc1+0.09")
      //  .fromTo("#ArrowNipImg1", { y: 220 }, { y: 0, duration: 0.5 }, "arc1+0.2")
      //  .fromTo("#ArrowLineImg1", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "arc1+0.09")
      //  .fromTo("#ArrowLineImg1", { scaleY: 0, y: 220 }, { scaleY: 1, duration: 0.5, transformOrigin: "bottom bottom" }, "arc1+0.2")
      //  .fromTo("#Text1", { opacity: 0 }, { opacity: 1, duration: 1 }, "+=0.2")
   
    this.step1Arc.pause();

    

    this.step1ArcReverse
      .to("#tab-3", { opacity: 0, duration: 0 }, "arc1")
      .to(".step2Move", { transform: "translateX(500px)", duration: 0.5,  delay: 0.25 }, "arc1")
      .fromTo(".step1Move", { transform: "translateX(-545px)" }, { transform: "translateX(-330px)", duration: 0.5, scale: 1, delay: 0.5 }, "arc1")
      
      //.to(".step2Move", { opacity: 1, duration: 0.5, delay: 0.5 }, "arc1")
    this.step1ArcReverse.pause();


  }
  arcAnimation(){
   
    this.step3Arc = gsap.timeline({
      onStart: () => {
        const divIds = ['step1Div', 'step2Div', 'step3Div'];
        divIds.forEach(id => {
          document.getElementById(id)?.classList.add('no-click');
        });
    },
    onComplete: () => {
      const divIds = ['step1Div', 'step2Div', 'step3Div'];
      divIds.forEach(id => {
        document.getElementById(id)?.classList.remove('no-click');
      });
    }
    });
    this.step3Arc

      .to(".step1Move", { transform: "translateX(-545px)", duration: 0.25, delay: 0, scale: 1 }, "arc3")
     
      .fromTo(".step2Move", { transform: "translateX(500px)", }, {  transform: "translateX(180px)", duration: 0.25, delay: 0, }, "arc3")
      .to(".step3Move", { transform: "translateX(0px)",opacity:1, duration: 0.25, delay: 0.25, }, "arc3")
      .to(".linemark1", { opacity:1, duration: 0.5, delay: 0.5, }, "arc3")

    //.fromTo(".stepBoxContent3", { opacity: 0 }, { opacity: 1, duration: 0.5, delay: 1.5 }, "arc3")
    //.fromTo(".step_3_arc", { opacity: 0, }, { opacity: 1, duration: 0.5, delay: 1 }, "arc3")
    //.fromTo("#mask", { scaleX: 0 }, { transform: `translate(${this.negativeDynamicX}, 0)`, scaleX: 150, duration: 2 ,delay: 0.3}, "arc3")
    //.fromTo("#arrow", { y: 0 }, { transform: `translate(${this.negativeDynamicX}, 0)`, y: 23, duration: 2 ,delay: 0.3}, "arc3")
    //.fromTo("#arrow_nip", { opacity: 0 }, { opacity: 1, duration: 1 ,delay: 0.3}, "arc3")
    //.fromTo("#arrow_nip", { y: 0 }, { y: -253, duration: 2 ,delay: 0.3}, "arc3")
    //.fromTo("#ImpliedGrowth", { opacity: 0 }, { opacity: 1, duration: 1, delay: 2.5 }, "arc3")
    //.fromTo("#Arrow_x5F_line", { scaleY: 0 }, { scaleY: 12, duration: 2, transformOrigin: "bottom bottom",delay: 0.3 }, "arc3")
    // .to("#h-f", { opacity: 1, duration: 1, delay: 0.3 }, "arc3")

      

this.step3Arc.pause();
  }
  Tabactive: number = 1;
  totalTabs: number = 3;
  isStepsFrom: number = 1;
  tabsActiveList: any = [1];
  setActiveTab(tabIndex: number) {
    this.isStepsFrom = this.tabsActiveList.length;
    this.Tabactive = tabIndex;
    //console.log('isStepsFrom', this.isStepsFrom);
    if (this.Tabactive == 1) {
      
      this.stepOneClick();
      this.studyClose(false);
      this.tabsActiveList = [1];
    }
    if (this.Tabactive == 2) {
      
      this.stepTwoClick();
      this.studyClose(false);
      this.tabsActiveList = [1, 2]
    }
    if (this.Tabactive == 3) {
     
      this.stepThreeClick();
      this.studyClose(false);
      this.tabsActiveList = [1, 2, 3]
    }
 
  }
  checkTabsActiveClass(val:number) {
    return this.tabsActiveList.indexOf(val) !== -1;
  }
 
  stepOneClick() {
    /*** STEP 1 **/
   
    //d3.select('#tab-1').style('opacity', 1);
   
    var tl = gsap.timeline({
      onStart: () => {
       tl.fromTo("#tab-3", { opacity: 1 }, { opacity: 0, duration: 0 }, "start")
        .fromTo("#tab-2", { opacity: 1 }, { opacity: 0, duration: 0 }, "start")
         .fromTo(".step1Move", { transform: "translateX(0px)" }, { transform: "translateX(0px)", duration: 0,}, "start")
        const divIds = ['step1Div', 'step2Div', 'step3Div'];
        divIds.forEach(id => {
          document.getElementById(id)?.classList.add('no-click');
        });

    },
    onComplete: () => {
      const divIds = ['step1Div', 'step2Div', 'step3Div'];

      divIds.forEach(id => {
        document.getElementById(id)?.classList.remove('no-click');
      });
    }
    });

    tl
      .fromTo(".step1Move", { transform: "translateX(0px)" }, { transform: "translateX(0px)", duration: 0, }, "start")
      .to(".linemark1", { opacity: 0, duration: 0, delay: 0, }, "arc3")
      .to("#tab-2", { opacity: 0, duration: 0, delay: 0, }, "arc3")
      .to("#tab-3", { opacity: 0, duration: 0, delay: 0, }, "arc3")
      .to("#tab-1", { opacity: 1, duration: 0.5, delay: 0, }, "arc3")
      .fromTo(".stepBoxContent2", { opacity: 0 }, { opacity: 1, duration: 0.5 }, "arc1")
    /*.fromTo(".graphImage2", { opacity: 0, y: -60 }, { opacity: 1, y: 0, duration: 0.5 }, "arc1");*/
    
    this.step1Arc.kill();
    this.step3Arc.kill();
    /*** STEP 1 **/
  }
  stepTwoClick() {
    /*** STEP 2 **/
    d3.select('#tab-1').style('opacity', 1); //// Graph visible
  
    var tl = gsap.timeline({
      onStart: () => {
        const divIds = ['step1Div', 'step2Div', 'step3Div'];
        divIds.forEach(id => {
          document.getElementById(id)?.classList.add('no-click');
        });
        
      },
      onComplete: () => {
        const divIds = ['step1Div', 'step2Div', 'step3Div'];
        divIds.forEach(id => {
          document.getElementById(id)?.classList.remove('no-click');
        });
      }
    });
    ////if (this.isStepsFrom == 1 && this.Tabactive == 2 ) {
    ////  tl.to(".step2Move", { x: '30%', duration: 0.5, scale: 0.78 }, "arc1")
    ////}
    ////if (this.isStepsFrom == 3 && this.Tabactive == 2) {
    ////  tl.to(".step2Move", { x: '0%', duration: 0, scale: 0.78 }, "arc1")
    ////}
    tl.to(".linemark1", { opacity: 0, duration: 0, delay: 0, }, "arc3")
    tl.fromTo("#tab-3", { opacity: 1 }, { opacity: 0, duration: 0 }, "start")
      .fromTo(".step3Move", { transform: "translateX(0px)", opacity: 0 }, { transform: "translateX(0px)", opacity: 0, duration: 0, delay: 0, }, "arc3")
    tl.fromTo("#tab-2", { opacity: 0, }, { opacity: 1, duration: 0.5, delay: 0.25 }, "start")
      .fromTo(".step2Move", { transform: "translateX(0px)", }, { transform: "translateX(0px)", duration: 0, delay: 0, }, "arc3")
    tl.fromTo(".stepBoxContent", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "none" }, "arc1")
    if (this.isStepsFrom == 3) {
      this.step1ArcReverse.timeScale(2).restart().then(() => {
        this.step1Arc.timeScale(2).restart();
      });

    } else {
      this.step1ArcStart.timeScale(2).restart().then(() => {
        this.step1Arc.timeScale(2).restart();
      });
    }
   
    /*** STEP 2 **/
  }
  negativeDynamicX:string = '0%'
  stepThreeClick(){
    //d3.select('#tab-1').style('opacity', 0);
    d3.select('#tab-3').style('opacity', 1);
    var tl = gsap.timeline({
      onStart: () => {
       
      },
      onComplete: () => {
      
      }
    });

    if (this.isStepsFrom == 1 && this.Tabactive == 3) {
      this.stepTwoClick();
      tl.fromTo("#tab-3", { opacity: 0 }, { opacity: 1, duration: 0 }, "start")
      this.step3Arc.timeScale(1).restart()
    } else {
      console.log('step3 click')
      this.step3Arc.timeScale(1).restart()
    }
    
  }
  //nextTab(): void {
  //  if (this.Tabactive < this.totalTabs) {
  //    this.Tabactive++;
  //  }
  //  if(this.Tabactive == 1){
  
  //    this.stepTwoClick();
  //  }
  //  if(this.Tabactive == 2){
  //    this.stepOneClick();
  //  }
  //  if(this.Tabactive == 3){
  //    this.stepThreeClick()
  //  }
  //}
  //prevTab(): void {
  //  if (this.Tabactive > 1) {
  //    this.Tabactive--;
  //  }
  //  if(this.Tabactive == 1){
  
  //    this.stepTwoClick();
  //  }
  //  if(this.Tabactive == 2){
  //    this.stepOneClick();
  //  }
  //  if(this.Tabactive == 3){
  //    this.stepThreeClick()
  //  }
  //}
  checkTranslateBG() {
    if (this.Tabactive == 1) {
      return 'translateX(-1%)'
    }
    else if (this.Tabactive == 2) {
      return 'translateX(112%)'
    } else { return 'translateX(230%)' }
  }
  showSummarypopup() {
    if (this.ticker == 'TSLA') {
      this.close();
    } else {
      this.isVisible = !this.isVisible;
      this.isOpenTesla = false;
      this.studyClose(false);
    }
    
  }
  popuptrans1(val: any) {
    let transval = val *2.2;
    return transval;
  }
  fetchScoreColor(score: any) {
    var that = this;
    if (isNotNullOrUndefined(score)) {
      return that.cl(score + 1);
    } else { return '#fff' }
  }
  popuptrans(selpopSC: any) {
    if (isNullOrUndefined(selpopSC) || selpopSC <= 0) { selpopSC = 0; } else if (selpopSC >= 100) { selpopSC = 100; }
    let transval =( 2.2* selpopSC);
    return "translate(" + transval + ",0)";;
  }

  getScoreDtls: any;
  loadData() {
    var that = this;
    if (isNotNullOrUndefined(that.selComp)) {
      var stockKey: number = 0;
      this.showSpinnerHis_loaded = true;
      this.companyC = that.companyName + " as of ";
      this.compName = that.companyName;
      if (isNotNullOrUndefined(that.selComp['stockKey'])) {
        stockKey = that.selComp['stockKey'];
        if (isNotNullOrUndefined(that.modalData.dialogSource['from']) && that.modalData.dialogSource['from'] == 'ETFUniverse') {
          var getEtf = that.dataService.GetScoreETFDtls(stockKey).pipe(first()).subscribe((res: any) => {
            this.getScoreDtls = res;
            if (res.length > 0) {
              that.HistIG = (format(",.1f")(res[0].HistIG * 100));
              this.CS_latest['HistIG'] = that.HistIG;
              if (isNotNullOrUndefined(res[0].MinRev) && isNotNullOrUndefined(res[0].MaxRev)) {
                that.mostLike_value = (isNotNullOrUndefined(res[0].MinRev))?(format(",.2f")(res[0].MinRev * 100))+'%':'';
                that.leastLike_value = (isNotNullOrUndefined(res[0].MaxRev)) ? (format(",.2f")(res[0].MaxRev * 100)) + '%' :'';
              } else {
                that.mostLike_value = "";
                that.leastLike_value = ""; }
            } else {
              that.HistIG = 0;
              that.mostLike_value = "";
              that.leastLike_value = "";
              this.CS_latest['HistIG'] = that.HistIG;
            }
            this.loadDate(res);
          });
          this.subscriptions.add(getEtf);
        } else {
          var getsco = that.dataService.GetScoreDtls(stockKey).pipe(first()).subscribe((res: any) => {
            this.getScoreDtls = res;
            if (res.length > 0) {
              that.HistIG = (format(",.1f")(res[0].HistIG * 100));
              this.CS_latest['HistIG'] = that.HistIG;
              if (isNotNullOrUndefined(res[0].MinRev) && isNotNullOrUndefined(res[0].MaxRev)) {
                that.mostLike_value = (isNotNullOrUndefined(res[0].MinRev)) ? (format(",.2f")(res[0].MinRev * 100)) + '%' : '';
                that.leastLike_value = (isNotNullOrUndefined(res[0].MaxRev)) ? (format(",.2f")(res[0].MaxRev * 100)) + '%' : '';
              } else {
                that.mostLike_value = "";
                that.leastLike_value = "";
              }
            } else {
              that.HistIG = 0;
              that.mostLike_value = "";
              that.leastLike_value = "";
              this.CS_latest['HistIG'] = that.HistIG;
            }
            this.loadDate(res);
         });
          this.subscriptions.add(getsco);
        }
      }
      if (isNotNullOrUndefined(that.selComp['impRev'])) { that.impRevValue = format(".1f")(that.selComp['impRev'] * 100); }
      if (isNotNullOrUndefined(that.selComp['score'])) { 
        that.selpopSC = parseFloat(format(".1f")(that.selComp['score'])); 
        // console.log(this.selpopSC,'selpopSC')
        var calc = (100 - that.selpopSC) * 0.18;
        const dynamicX = (100 - that.selpopSC) - calc;
        this.negativeDynamicX = `-${dynamicX}%`;
        // console.log(this.negativeDynamicX,'negativeDynamicX')
        // this.step3Arc.restart();
        this.arcAnimation()
      }
      if (isNotNullOrUndefined(that.selComp['price'])) {
        var cur: any = (that.selComp['currency']) ? that.selComp['currency'] : "";
        that.stockPrice =  cur+""+format(",.1f")(parseFloat(that.selComp['price']));
      } else { this.stockPrice = "-"; }      
      //this.CS_latest['HistIG']=that.HistIG;
      this.CS_latest['Scores']=that.selComp['score'];
      this.CS_latest['Price']=that.selComp['price'];
      this.CS_latest['ImpliedRevenue']=that.selComp['impRev'];
     //console.log(this.CS_latest, 'this.CS_latest');
    }
  }

  loadDate(date:any) {
    var that = this;
    this.showSpinnerHis_loaded = false;
    if (isNotNullOrUndefined(date[0]['Tradedate'])) {      
      var dt = new Date(date[0]['Tradedate']);
      var indate = formatDate(dt, 'MMM', 'en-US');
      this.companyC = that.companyName + " as of ";
      this.companyCDate = indate + " " + dt.getDate() + ", " + dt.getFullYear();
      console.log(this.companyCDate)
    }else if (isNotNullOrUndefined(that.selComp['tradeDate'])) {
      var date_t = that.selComp["tradeDate"];
      var dat = date_t.slice(4, 6) + "/" + date_t.slice(6, 8) + "/" + date_t.slice(0, 4);
      this.formattedDate = this.pipe.transform(dat, 'mediumDate');
      var a = this.formattedDate.split(" ")[0];
      var b = this.formattedDate.split(",")[1].trim();
      var c = this.formattedDate.split(" ")[1].split(",")[0];
      this.companyC = that.companyName + " as of " + a + " " + c + ", " + b;
      console.log(this.companyCDate)
    }
  }
  nameTrim(Cname:any) {
    if ((Cname.length) > 18) { return Cname.slice(0, 18).trim() + "..."; }
    else { return Cname; }
  }
  compTrim(Cname:any){
    if ((Cname.length) > 27) { return Cname.slice(0, 27).trim() + "..."; }
    else { return Cname; }
  }
  close() { this.dialogref.close(); }
  activeTab: string = 'igr';
  toggle(tab: string) {
    var that = this;
    this.activeTab = tab;
    if (this.activeTab == 'gme') {
      if (isNotNullOrUndefined(that.modalData.dialogSource['from']) && that.modalData.dialogSource['from'] == 'ETFUniverse') { that.callHistETFData(); } else { that.callHistData(); }
    }
  }
  dateFormat(date_t: any) {
    var dt = new Date(date_t);
    // console.log(date_t,'date')
    // console.log(formatDate(date_t, 'MMM', 'en-US'),dt.getDate(),dt.getFullYear(),'date_t')
    // var dat = date_t.slice(5, 7) + "/" + date_t.slice(8, 10) + "/" + date_t.slice(0, 4);
    var dat = formatDate(date_t, 'MMM', 'en-US') +" "+ dt.getDate() + ", " + dt.getFullYear();
    // console.log(dat,'dat')
    return dat;
  }

  convertNum(d:any) {
    return Number(d);
  }
  ngOnDestroy() { this.subscriptions.unsubscribe(); }
  ppt_hisData: any = [];
  ppt_hisData_Dates: any = [];
  ppt_hisData_Price: any = [];
  showSpinnerPPT_loaded: boolean = false;
  showSpinnerHis_loaded: boolean = false;
  pointsToUpdate: any=[];
  callHistData() {
    var that = this;
    that.showSpinnerPPT_loaded = true;
    let getData = { "ticker": that.ticker }
    setTimeout(() => {
    const bList = that.dataService.GetHistTickerIgData(getData).pipe(first()).subscribe((slides: any) => {
      if (slides[0] != "Failed") {
        that.ppt_hisData = [...slides];
        const filterDates = [...that.ppt_hisData].map(item => { return item.TradeDate.split('T')[0]; });
        const filterPrice = [...that.ppt_hisData].map(item => { return item.Price; });
        that.ppt_hisData_Dates = filterDates;
        that.ppt_hisData_Price = filterPrice;
        setTimeout(() => {
          that.selHighVal = 0;
          /*chart clicked values*/
          //const highestPriceObject = [...that.ppt_hisData].reduce((prev, current) => {
          //  return (prev.Price > current.Price) ? prev : current;
          //});
          //that.startValPrice = that.ppt_hisData[0];
          //that.midValPrice = highestPriceObject;
          //that.endValPrice = that.ppt_hisData[that.ppt_hisData.length - 1];
          //console.log(that.startValPrice, that.midValPrice, that.endValPrice)
          //// Load initial value 
          var highestPriceObject:any = [...that.ppt_hisData].filter(x => isNotNullOrUndefined(x.HistIG)).sort((a: any, b: any) => { return <any>new Date(b.TradeDate) + <any>new Date(a.TradeDate); });          
          if (highestPriceObject.length > 0) { that.startValPrice = highestPriceObject[0]; };
          if (highestPriceObject.length > 1) { that.midValPrice = highestPriceObject[1]; };
          if (highestPriceObject.length > 2) { that.endValPrice = highestPriceObject[2]; };
          if (highestPriceObject.length > 3) { that.latestValPrice = highestPriceObject[3]; };
          that.pointsToUpdate = [...that.ppt_hisData].map((x: any, i: any) => { if (isNotNullOrUndefined(x.HistIG)) { return i } }).filter(x => isNotNullOrUndefined(x));
          /**** load default latest price if gaving ****/
          if (that.pointsToUpdate.length > 0 && isNotNullOrUndefined(that.latestValPrice)) {
            that.selHighVal = that.pointsToUpdate[that.pointsToUpdate.length-1];
            that.selectedChartValue = that.latestValPrice;
          }
          else if(that.pointsToUpdate.length > 0){
            that.selHighVal = that.pointsToUpdate[0];
            that.selectedChartValue = that.startValPrice;
          }
          else {
            that.selectedChartValue = undefined;
            that.selHighVal = undefined;
          }
           /**** load default latest price if gaving ****/
          /*chart clicked values*/
          //console.log('midValPrice', that.midValPrice);
          //console.log('latestValPrice', that.latestValPrice);
          // that.loadLineChart();
          that.showSpinnerPPT_loaded = false;
        }, 100)
      }
    }, error => { that.showSpinnerPPT_loaded = false; this.toggle('igr'); });
      that.subscriptions.add(bList);
    }, 10)
  }

  callHistETFData() {
    var that = this;
    that.showSpinnerPPT_loaded = true;
    let getData = { "ticker": that.ticker }
    setTimeout(() => {
     var getHis= that.dataService.GetHistTickerIgETFData(getData).pipe(first()).subscribe((slides: any) => {
        if (slides[0] != "Failed") {
          that.ppt_hisData = [...slides];
          const filterDates = [...that.ppt_hisData].map(item => { return item.TradeDate.split('T')[0]; });
          const filterPrice = [...that.ppt_hisData].map(item => { return item.Price; });
          that.ppt_hisData_Dates = filterDates;
          that.ppt_hisData_Price = filterPrice;
          setTimeout(() => {
            that.selHighVal = 0;
            var highestPriceObject: any = [...that.ppt_hisData].filter(x => isNotNullOrUndefined(x.HistIG)).sort((a: any, b: any) => { return <any>new Date(b.TradeDate) + <any>new Date(a.TradeDate); });
            if (highestPriceObject.length > 0) { that.startValPrice = highestPriceObject[0]; };
            if (highestPriceObject.length > 1) { that.midValPrice = highestPriceObject[1]; };
            if (highestPriceObject.length > 2) { that.endValPrice = highestPriceObject[2]; };
            if (highestPriceObject.length > 3) { that.latestValPrice = highestPriceObject[3]; };
            that.pointsToUpdate = [...that.ppt_hisData].map((x: any, i: any) => { if (isNotNullOrUndefined(x.HistIG)) { return i } }).filter(x => isNotNullOrUndefined(x));
            /**** load default latest price if gaving ****/
            if (that.pointsToUpdate.length > 0 && isNotNullOrUndefined(that.latestValPrice)) {
              that.selHighVal = that.pointsToUpdate[that.pointsToUpdate.length - 1];
              that.selectedChartValue = that.latestValPrice;
            }
            else if (that.pointsToUpdate.length > 0) {
              that.selHighVal = that.pointsToUpdate[0];
              that.selectedChartValue = that.startValPrice;
            }
            else {
              that.selectedChartValue = undefined;
              that.selHighVal = undefined;
            }
            // that.loadLineChart();
            that.showSpinnerPPT_loaded = false;
          }, 100)
        }
      }, error => { that.showSpinnerPPT_loaded = false; this.toggle('igr'); });
      that.subscriptions.add(getHis);
    }, 10)
  }

  moveLegendBox() {
    var datalength = [...this.pointsToUpdate];
    if (datalength.length > 0 && this.selHighVal === datalength[0]) { return 'f-start'; }
    else if (datalength.length > 1 && this.selHighVal === datalength[1]) { return 'f-center'; }
    else if (datalength.length > 0 && this.selHighVal === datalength[datalength.length-1]) { return 'f-end'; }
    else { return 'f-end'; };
  }
  moveLegendBoxBottom() {
    var datalength = [...this.pointsToUpdate];
    if (datalength.length > 0 && this.selHighVal === datalength[0]) { return '0%'; }
    else if (datalength.length > 1 && this.selHighVal === datalength[1]) { return '33%'; }
    else { return '65%'; };
  }
  updateData(price: any) {
    var that = this;
    that.selectedChartValue = undefined; 
    if (that.startValPrice['Price'] == price) { that.selectedChartValue = that.startValPrice; }
    else if (that.midValPrice['Price'] == price) { that.selectedChartValue = that.midValPrice; }
    else if (that.endValPrice['Price'] == price) { that.selectedChartValue = that.endValPrice; }
    else if (that.latestValPrice['Price'] == price) { that.selectedChartValue = that.latestValPrice; }
    else { that.selectedChartValue = undefined; }
  }
  selHighVal: any = 0;
  startValPrice: any;
  selectedChartValue: any;
  midValPrice: any;
  endValPrice: any;
  latestValPrice: any;
  histChart: any;
  loadLineChart() {
    var that = this;
    //var title: string = '';
    var title: string = that.companyName + " (" + (that.ticker) + ')';
    var data: any = [...this.ppt_hisData_Price];
    var series: any = [{ name: title, data: data, color: 'var(--linkColor)' }];
    const pointsToUpdate = [...that.pointsToUpdate];
    var date = this.ppt_hisData_Dates;

    Highcharts.setOptions({ lang: { thousandsSep: ',' } });
    that.histChart = Highcharts.chart({
      chart: {
        renderTo: 'lineChartBuyModel_dirIndex', type: 'spline', style: { fontFamily: 'var(ff-medium)' },
        events: {
          load: function () {
            const chart = this,
              series = chart.series[0],
              points = series.points;
            points.forEach(function (point) {
              if (pointsToUpdate.includes(point.x)) {
                point.update({ color: 'var(--linkColor)' });
                point.update({ marker: { radius: 5, enabled: true } });
                if (point['x'] == that.selHighVal) {
                  point.update({ marker: { radius: 8, enabled: true } });
                }
              } else { point.update({ marker: { radius: 0.5, enabled: false } }); }
            });
          }
        },        
      },
      title: { text: '', style: { color: 'var(--iconColor)', fontSize: '13px', fontFamily: 'var(ff-medium)' } },
      plotOptions: {
        series: {
          lineWidth: 0.5,
          events: {
            click: function (ev) {
              if (isNotNullOrUndefined(ev.point) && isNotNullOrUndefined(ev.point['x'])) {
                var val: any = ev.point['x'];
                if (pointsToUpdate.includes(val)) {
                  that.selHighVal = val;
                  /** reser points **/
                  const resetPoint = that.histChart.series[0].points;
                  resetPoint.forEach(function (pointss: any) {
                    if (pointss['marker']['radius'] == 8){
                      pointss.update({ marker: { radius: 4, enabled: true } });
                    }
                    if (pointss['x'] == val) {
                      pointss.update({ marker: { radius: 8, enabled: true } });
                    }
                  });
                  //resetPoint.update({ marker: { radius: 5, enabled: true } });
                  /** reser points **/
                  //setTimeout(() => {
                  //const point = that.histChart.series[0].points[val]; // Adjust the index as needed
                  //point.update({ marker: { radius: 8, enabled: true } });
                  //}, 1000)
                  
                  //that.histChart.xAxis[0].options.plotLines[0].value = val;
                  //that.histChart.xAxis[0].update();
                  that.updateData(ev.point['y']);
                  //that.loadLineChart();
                }
              }
            }
          }
        },
      },
      xAxis: {
        type: 'datetime',
        categories: date,
        labels: {
          formatter: function () {
            let d = new Date(this.value);
            var currentMonth: any = (d.getMonth() + 1);
            if (currentMonth < 10) { currentMonth = '0' + currentMonth; }
            return (currentMonth + '/' + d.getFullYear().toString());
          },
        },
        //plotLines: [{ color: 'var(--linkColor)', width: 2, value: that.selHighVal, label: { text: '', } }]
      },
      yAxis: {
        title: { text: '' }
      },
      legend: {
        y: 0,
        verticalAlign: 'top',
        floating: false,
      },
      series: series,
      lang: { noData: "No data to display", },
      noData: { style: { fontWeight: 'bold', fontSize: '15px', color: '#303030' } },
     credits: { enabled: false },
   });
  }
  formatScore(d:any){
    let number = d*100;
    //let truncated = Math.floor(number * 10) / 10;
    return number.toFixed(1);
  }
  activeBtn:string='f-latest';
  updateHistChart(from: any) {
    var that = this;
    //console.log('pointsToUpdate', that.pointsToUpdate);
    if (from == 'start') {
       that.activeBtn = 'f-start';
      if (that.pointsToUpdate.length > 0) { that.selHighVal = that.pointsToUpdate[0]; }
      that.mostLike_value = (isNotNullOrUndefined(that.startValPrice.MinRev)) ? (format(",.2f")(that.startValPrice.MinRev * 100)) + '%' : '';
      that.leastLike_value = (isNotNullOrUndefined(that.startValPrice.MaxRev)) ? (format(",.2f")(that.startValPrice.MaxRev * 100)) + '%' : '';
      var selectprice = that.startValPrice['Price'];
      // const resetPoint = that.histChart.series[0].points;
      // resetPoint.forEach(function (pointss: any) {
      //   if (pointss['marker']['radius'] == 8) {
      //     pointss.update({ marker: { radius: 4, enabled: true } });
      //   }
      //   if (pointss['x'] == that.selHighVal) {
      //     pointss.update({ marker: { radius: 8, enabled: true } });
      //   }
      // });
      //that.histChart.xAxis[0].options.plotLines[0].value = that.selHighVal;
      //that.histChart.xAxis[0].update();
      that.updateData(selectprice);
    } else if (from == 'end') {
       that.activeBtn = 'f-end';
      var selectprice = that.endValPrice['Price'];
      if (that.pointsToUpdate.length > 0) { that.selHighVal = that.pointsToUpdate[2]; }
      that.mostLike_value = (isNotNullOrUndefined(that.endValPrice.MinRev)) ? (format(",.2f")(that.endValPrice.MinRev * 100)) + '%' : '';
      that.leastLike_value = (isNotNullOrUndefined(that.endValPrice.MaxRev)) ? (format(",.2f")(that.endValPrice.MaxRev * 100)) + '%' : '';
      // const resetPoint = that.histChart.series[0].points;
      // resetPoint.forEach(function (pointss: any) {
      //   if (pointss['marker']['radius'] == 8) {
      //     pointss.update({ marker: { radius: 4, enabled: true } });
      //   }
      //   if (pointss['x'] == that.selHighVal) {
      //     pointss.update({ marker: { radius: 8, enabled: true } });
      //   }
      // });
      //that.histChart.xAxis[0].options.plotLines[0].value = that.selHighVal;
      //that.histChart.xAxis[0].update();
      that.updateData(selectprice);
    }else if (from == 'latest') {
      that.activeBtn = 'f-latest';
      var selectprice = that.latestValPrice['Price'];
      if (that.pointsToUpdate.length > 0) { that.selHighVal = that.pointsToUpdate[that.pointsToUpdate.length - 1]; }
      that.mostLike_value = (isNotNullOrUndefined(that.latestValPrice.MinRev)) ? (format(",.2f")(that.latestValPrice.MinRev * 100)) + '%' : '';
      that.leastLike_value = (isNotNullOrUndefined(that.latestValPrice.MaxRev)) ? (format(",.2f")(that.latestValPrice.MaxRev * 100)) + '%' : '';

      if (isNullOrUndefined(that.latestValPrice.MinRev) && isNotNullOrUndefined(this.getScoreDtls) && this.getScoreDtls.length >0) {
        that.mostLike_value = (isNotNullOrUndefined(that.getScoreDtls[0].MinRev)) ? (format(",.2f")(that.getScoreDtls[0].MinRev * 100)) + '%' : '';
        that.leastLike_value = (isNotNullOrUndefined(that.getScoreDtls[0].MaxRev)) ? (format(",.2f")(that.getScoreDtls[0].MaxRev * 100)) + '%' : '';        
      }
      // const resetPoint = that.histChart.series[0].points;
      // resetPoint.forEach(function (pointss: any) {
      //   if (pointss['marker']['radius'] == 8) {
      //     pointss.update({ marker: { radius: 4, enabled: true } });
      //   }
      //   if (pointss['x'] == that.selHighVal) {
      //     pointss.update({ marker: { radius: 8, enabled: true } });
      //   }
      // });
      //that.histChart.xAxis[0].options.plotLines[0].value = that.selHighVal;
      //that.histChart.xAxis[0].update();
      that.updateData(selectprice);
    }
    else {
       that.activeBtn = 'f-center';
      var selectprice = that.midValPrice['Price'];
      if (that.pointsToUpdate.length > 1) { that.selHighVal = that.pointsToUpdate[1]; }
      that.mostLike_value = (isNotNullOrUndefined(that.midValPrice.MinRev)) ? (format(",.2f")(that.midValPrice.MinRev * 100)) + '%' : '';
      that.leastLike_value = (isNotNullOrUndefined(that.midValPrice.MaxRev)) ? (format(",.2f")(that.midValPrice.MaxRev * 100)) + '%' : '';
      // const resetPoint = that.histChart.series[0].points;
      // resetPoint.forEach(function (pointss: any) {
      //   if (pointss['marker']['radius'] == 8) {
      //     pointss.update({ marker: { radius: 4, enabled: true } });
      //   }
      //   if (pointss['x'] == that.selHighVal) {
      //     pointss.update({ marker: { radius: 8, enabled: true } });
      //   }
      // });
      //that.histChart.xAxis[0].options.plotLines[0].value = that.selHighVal;
      //that.histChart.xAxis[0].update();
      that.updateData(selectprice);
    }
  }
  isHovered = false;
  isstep2Hovered = false;
  isstep3Hovered = false;
  isDCFHovered = false;
  isCloseHovered = false;

  onHover(state: boolean): void {
    this.isHovered = state;
  }
  onHoverDCF(state: boolean): void {
      this.isDCFHovered = state;
  }
  studyClose(state: boolean): void {
    this.isDCFHovered = state;
  }
  step2onHover(state: boolean): void {
    this.isstep2Hovered = state;
  }
  step3onHover(state: boolean): void {
    this.isstep3Hovered = state;
  }
  isOpenTesla: boolean = false;
  openTeslaCaseStudy(d:any){
  
    if(d == 'igr'){
      // console.log(d,'d')
      this.isOpenTesla = false;
    }
    else{
      // console.log(d,'d')
      this.isOpenTesla = true;
    }
   
  }
}
