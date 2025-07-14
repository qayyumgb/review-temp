import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, Inject, ChangeDetectorRef, HostListener, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FormControl, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { CustomIndexService } from '../../core/services/moduleService/custom-index.service';
import { isNotNullOrUndefined, SharedDataService } from '../../core/services/sharedData/shared-data.service';
import { first, Observable } from 'rxjs';
import { Subscription, ReplaySubject } from 'rxjs';
import * as Highcharts from 'highcharts/highstock';
import More from 'highcharts/highcharts-more';
import Drilldown from 'highcharts/modules/drilldown';
import { MatDialogRef } from '@angular/material/dialog';
import { environment } from '../../../environments/environment';
import { DirectIndexService } from '../../core/services/moduleService/direct-index.service';
import { PrebuildIndexService } from '../../core/services/moduleService/prebuild-index.service';
Drilldown(Highcharts);
More(Highcharts);
declare var $: any;
const incr = 1;

export class FileToUpload {
  fileName: string = "";
  fileSize: number = 0;
  fileType: string = "";
  lastModifiedTime: number = 0;
  lastModifiedDate: Date | null = null;
  fileAsBase64: string = "";
  comments: string = "";
  feedbackpath: string = "";
  userid: number | any;
}
@Component({
  selector: 'app-feedback',
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class FeedbackComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('inputFile') myInputVariable: ElementRef | any;
  subscriptions = new Subscription();
  feedbackForm: FormGroup | any;
  submitted = false;
  theFiles: any[] = [];
  MAX_SIZE: number = 1048576; // 1 MB
  base64Output: string | any;
  fileupload = new FileToUpload();
  maxChars = 1000;
  showLoad: boolean = false;
  isbigfile: boolean = false;
  isFeedBackSumbit: boolean = false;

  private API_URL = environment.api_url + '/users/Fileupload';

  //API_URL = "http://localhost:44359/api/FileUpload/Fileupload";
  userid = Number(atob(atob(atob(JSON.parse(sessionStorage['currentUser']).userId))));
  /* showModalLoader: boolean = false;*/
  breadcrumbdata: any = [];
  path: string | any;
  httpOptions: any = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(public sharedData: SharedDataService, public cusIndexService: CustomIndexService, public preIndexService: PrebuildIndexService,
    public dirIndexService: DirectIndexService, private httpClient: HttpClient,
    public dialog: MatDialog, private toastr: ToastrService, private dialogref: MatDialogRef<FeedbackComponent>) { }

  ngOnDestroy() { this.subscriptions.unsubscribe(); }


  ngOnInit() {
    var that = this;
    $("#btnsubmit").attr("disabled", true);
    this.feedbackForm = new FormGroup({
      feedbacktext: new FormControl('', [Validators.required, Validators.min(15), Validators.pattern(/^[A-Za-z0-9,?.!&\s]*$/)])
    })
   
    var url = window.location.pathname;
    if (url == '/home') { this.path = 'Home'; }
    //else if (url == '/erflibrary') {
    //  this.path = 'ERFLibrary';
    //  this.sharedData.breadcrumbdata.subscribe(data => {
    //    this.breadcrumbdata = data;
    //    if (that.breadcrumbdata.length > 0) {
    //      this.breadcrumbdata.forEach(e => {
    //        this.path = this.path + '->' + e.name;
    //      });
    //    }
    //  });
    //}
    //else if (url == '/customIndexing') {
    //  this.path = 'CustomIndexing';
    //  this.cusIndexService.bldIndBrcmData.subscribe(data => {
    //    this.breadcrumbdata = data;
    //    if (that.breadcrumbdata.length > 0) { this.breadcrumbdata.forEach(e => { this.path = this.path + '->' + e.name; }); }
    //  });
    //}
    //else if (url == '/directIndexing') {
    //  this.path = 'DirectIndexing';
    //  this.dirIndexService.prebuiltBrcmData.subscribe(data => {
    //    this.breadcrumbdata = data;
    //    if (that.breadcrumbdata.length > 0) { this.breadcrumbdata.forEach(e => { this.path = this.path + '->' + e.name; }); }
    //  });
    //} else if (url == '/approvedStrategies') {
    //  this.path = 'ApprovedStrategies';
    //  this.dirIndexService.prebuiltBrcmData.subscribe(data => {
    //    this.breadcrumbdata = data;
    //    if (that.breadcrumbdata.length > 0) { this.breadcrumbdata.forEach(e => { this.path = this.path + '->' + e.name; }); }
    //  });
    //}
    //else if (url == '/prebuilt') {
    //  this.path = 'PreBuilt';
    //  this.preIndexService.naaIndex_bcum.subscribe(data => {
    //    this.breadcrumbdata = data;
    //    if (that.breadcrumbdata.length > 0) { this.breadcrumbdata.forEach(e => { this.path = this.path + '->' + e.name; }); }
    //  });
    //}
    else if (url == '/myStrategies') { this.path = 'MyStrategies' }
    else if (url == '/account') { this.path = 'Account' }
    else if (url == '/trade') { this.path = 'Trade'; }
    else if (url == '/prebuilt') { this.path = 'PreBuilt'; }
    else if (url == '/approvedStrategies') { this.path = 'ApprovedStrategies'; }
    else if (url == '/directIndexing') { this.path = 'DirectIndexing'; }
    else if (url == '/customIndexing') { this.path = 'CustomIndexing'; }
    else if (url == '/thematicStrategies') { this.path = 'ThematicStrategies'; }
    else if (url == '/erflibrary') { this.path = 'ERFLibrary'; }
    else if (url == '/equityUniverse') { this.path = 'EquityUniverse'; }
    else if (url == '/etfUniverse') { this.path = 'ETFUniverse'; }
    $('#showMatLoaderAccountsF').hide();
  }
  ngAfterViewInit() { $('#showMatLoaderAccountsF').hide();  }
  isFileAllowed: boolean = false;
  filechange(event: any) {
    this.theFiles = [];
    const fi = $('#file');
    const fsize = fi[0].files[0].size;
    const fname = fi[0].files[0].name;
    const file = Math.round((fsize / 1024));
    if (file >= 1000) {
      this.isbigfile = true;
      $("#size").innerHTML = 'Please select a file less than 1MB';
      $('.filenamepos').css('left', '9rem');
      this.submitted = false;
      $("#fname").innerHTML = '' + fname + ' (' + file + 'KB)';
      $("#crossIcon").innerHTML = '<span class="material-icons">delete_forever</span>';
      $("#successIcon").innerHTML = '';
      $("#btnsubmit").attr("disabled", true);
    } else {
      this.isbigfile = false;
      this.theFiles.push(event.target.files[0]);
      this.fileupload = new FileToUpload();
      this.fileupload.fileName = this.theFiles[0].name;
      this.fileupload.fileSize = this.theFiles[0].size;
      this.fileupload.fileType = this.theFiles[0].type;
      this.fileupload.lastModifiedTime = this.theFiles[0].lastModified;
      this.fileupload.lastModifiedDate = this.theFiles[0].lastModifiedDate;
      this.fileupload.comments = this.feedbackForm.controls['feedbacktext'].value;//this.feedbackForm['feedbacktext'].value;
      this.fileupload.feedbackpath = this.path;
      this.fileupload.fileAsBase64 = this.base64Output;
      var text = this.fileupload.comments.trim();
      if (text.length >= 0) { this.submitted = true; } else { this.submitted = false; }
      $('.filenamepos').css('left', '11rem');
      $("#fname").innerHTML = '' + fname + ' (' + file + 'KB)';
      $("#successIcon").innerHTML = '<span class="material-icons">check_circle</span>';
      $("#size").innerHTML = '';
      $("#crossIcon").innerHTML = '<span class="material-icons">delete_forever</span>';
    }
  }

  get f(): { [key: string]: AbstractControl } { return this.feedbackForm.controls; }

  clear() {
    $("#fname").innerHTML = '';
    $("#size").innerHTML = '';
    $("#crossIcon").innerHTML = '';
    $("#successIcon").innerHTML = '';
    this.myInputVariable.nativeElement.value = null;
    this.fileupload = new FileToUpload();
    this.isbigfile = false;
    var text = this.feedbackForm.controls['feedbacktext'].value.trim();
    if (text.length >= 0)
      this.submitted = true;
    else
      this.submitted = false;
  }

  onFileSelected(event: any) {
    var Fileextens = (event.target.files[0].type).split('/')[1];
    if (Fileextens == "png" || Fileextens == "gif" || Fileextens == "doc" || Fileextens == "docx"
      || Fileextens == "pdf" || Fileextens == "jpg" || Fileextens == "jpeg") {
      this.convertFile(event.target.files[0]).subscribe(base64 => {
        this.base64Output = base64;
        this.filechange(event);
      });
    } else {
      this.toastr.info("This file format is not supported", '', {
        timeOut: 10000,
        positionClass: 'toast-top-center'
      });
      return;
    }
  }


  convertFile(file: File): Observable<string> {
    const result = new ReplaySubject<string>(1);
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) => result.next(btoa(event.target.result.toString()));
    return result;
  }

  pressed(ev: any) {
    var e: any = ev.target.value
    var text = e.trim();
    if (this.isbigfile == false) {
      if (text.length >= 0)
        this.submitted = true;
      else
        this.submitted = false;
    } else { this.submitted = false; }
  }

  disableEnterKey(e: any) {
    const targetTagName = (e.target as HTMLElement).tagName.toLowerCase();
    if ((e.keyCode === 13 || e.keyCode === 20 || e.keyCode === 16 || e.keyCode === 17) && targetTagName !== 'textarea') {
      e.preventDefault();
    }
    else {
      var text = this.feedbackForm.controls['feedbacktext'].value.trim();
      if (this.isbigfile == false) {
        if (text.length >= 0)
          this.submitted = true;
        else
          this.submitted = false;
      } else { this.submitted = false; };
    }
  }

  hasError3(controlName: string, errorName: string) { return this.feedbackForm.controls[controlName].hasError(errorName); }

  encodeHTML(input: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
      '`': '&#x60;',
      '=': '&#x3D;',
      '*': '&ast',
    };
    const reg = /[&<>"'`=]/g;
    return input.replace(reg, (match) => map[match]);
  }
  onSubmit() {
    var that = this;
    that.isFeedBackSumbit = true;
    if (that.feedbackForm.valid) {
      var lines = (this.feedbackForm.controls['feedbacktext'].value).split('\n');
      var quotedLines = lines.map(function (line: any) { return ' ' + line.trim() + ''; });
      var outputString = quotedLines.join(' ');
      this.fileupload.comments = outputString;
      var text: string = this.feedbackForm.controls['feedbacktext'].value.trim();
      this.fileupload.feedbackpath = this.path;
      this.fileupload.userid = this.userid;
      if (this.feedbackForm.controls['feedbacktext'].value == '') {
        this.toastr.info("Please Enter comments", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
        return;
      }
      else if (text.length <= 0) {
        this.toastr.info("Please Enter valid comments", '', {
          timeOut: 10000,
          positionClass: 'toast-top-center'
        });
        return;
      }
      else {
        if (!this.showLoad && this.submitted) {
          $('#showMatLoaderAccountsF').show();
          this.showLoad = true;
          this.fileupload.comments = this.fileupload.comments;
          var dt = {
            "userid": this.userid,
            "comments": this.fileupload.comments,
            "feedbackpath": this.path,
          }
          this.httpClient.post(this.API_URL, dt).pipe(first()).subscribe((data : any) => {
              if (data['message'] == 'Success') {
                this.toastr.success('Thanks for contacting us!', '', {
                  timeOut: 5000,
                  positionClass: 'toast-top-center'
                });
                this.dialogref.close();
              }
              else {
                this.toastr.error(data['message'], '', {
                  timeOut: 5000
                });
              }
              this.showLoad = false;
              $('#showMatLoaderAccountsF').hide();
            });
        }
      }
    }
  }
  closeModal() { this.dialogref.close(); }
}
