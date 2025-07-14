import { Injectable, NgZone } from '@angular/core';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IndexConstComponent } from '../../Dialogs/index-const/index-const.component';
//import { MatDialogModule } from '@angular/material/dialog';
//import { ALLineChartComponent } from '../../Dialogs/al-line-chart/al-line-chart.component';
/*import { ConfDialogComponent } from '../../Dialogs/conf-dialog/conf-dialog.component';*/
//import { HistoryALLineChartComponent } from '../../Dialogs/history-alline-chart/history-alline-chart.component';
//import { ImpliedRevenueComponent } from '../../Dialogs/implied-revenue/implied-revenue.component';
//import { PortfolioLineChartComponent } from '../../Dialogs/portfolio-line-chart/portfolio-line-chart.component';


@Injectable({
  providedIn: 'root'
})
export class DialogControllerService {

  constructor(private dialog: MatDialog, private ngZone: NgZone) { }


  openTrade(component: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.disableClose = false;
    this.dialog.open(component, { disableClose: true, width: "90vw", height: "94vh", maxWidth: "1600px", maxHeight: "94vh", panelClass: 'customTradePage' });
  }

  openIndexConst(component: any) {
    var that = this;
    this.ngZone.run(() => {
      var indexConstComponent1 = that.dialog.open(component, { width: "90vw", height: "90vh", maxWidth: "1600px", maxHeight: "90vh" });
    })
  }
}
