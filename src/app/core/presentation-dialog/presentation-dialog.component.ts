export class DialogModel {
  constructor(public title: string,public dynamic:string) {
  }
}
import { Component, OnDestroy, OnInit, AfterViewInit,Inject } from '@angular/core';
import { MatDialogRef,MAT_DIALOG_DATA } from '@angular/material/dialog'

@Component({
  selector: 'app-presentation-dialog',
  templateUrl: './presentation-dialog.component.html',
  styleUrl: './presentation-dialog.component.scss'
})
export class PresentationDialogComponent implements OnInit, OnDestroy, AfterViewInit{
  title: string;
  dynamic:string;
  constructor(private dialogref: MatDialogRef<PresentationDialogComponent>,@Inject(MAT_DIALOG_DATA) public data: DialogModel) { 
    this.title = data.title;
    this.dynamic = data.dynamic;
  }
  ngOnInit() { }
  ngAfterViewInit() { }
  ngOnDestroy() { }
  closeModal() { this.dialogref.close(); };

}
