import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NumformatPipe, percentformatPipe, numValueformatPipe, markerCapformatPipe, numValformatPipe } from '../pipes/numformat.pipe';
import { NumWithCommaPipe, NumWithCommaPipeRtnNullDash, NumWithCommaPipeRtnPercent } from '../pipes/num-with-comma.pipe';
import { NullDashPipePipe } from '../pipes/null-dash-pipe.pipe';
import { PriceFormatPipe } from '../pipes/price-format.pipe';
import { WeightFormatPerWithDigitPipe, WeightFormatPipe, weightFormatWithKeyPipe } from '../pipes/weight-format.pipe';
import { ChangeCamelCasePipe } from '../pipes/change-camel-case.pipe';
import { CustomPipe, numFormatWithDashPipe, dateFormatPipe, factorFormatPipe, factorGFormatPipe, factorinputFormatPipe, WtFormatPerDigitPipe, accountFilterPipe } from '../pipes/custom.pipe';



@NgModule({
  declarations: [accountFilterPipe, WeightFormatPerWithDigitPipe, factorinputFormatPipe, factorGFormatPipe, factorFormatPipe, dateFormatPipe, numFormatWithDashPipe, numValformatPipe, CustomPipe, ChangeCamelCasePipe, weightFormatWithKeyPipe, markerCapformatPipe, numValueformatPipe, percentformatPipe, NumformatPipe, NumWithCommaPipe, NumWithCommaPipeRtnNullDash, NullDashPipePipe, PriceFormatPipe, WeightFormatPipe, NumWithCommaPipeRtnPercent, WtFormatPerDigitPipe],
  imports: [CommonModule],
  providers: [accountFilterPipe, WeightFormatPerWithDigitPipe, factorinputFormatPipe, factorGFormatPipe, factorFormatPipe, dateFormatPipe, numFormatWithDashPipe, numValformatPipe, CustomPipe, ChangeCamelCasePipe, weightFormatWithKeyPipe, markerCapformatPipe, numValueformatPipe, percentformatPipe, NumformatPipe, NumWithCommaPipe, NumWithCommaPipeRtnNullDash, NullDashPipePipe, PriceFormatPipe, WeightFormatPipe, NumWithCommaPipeRtnPercent, WtFormatPerDigitPipe],
  exports: [accountFilterPipe, WeightFormatPerWithDigitPipe, factorinputFormatPipe, factorGFormatPipe, factorFormatPipe, dateFormatPipe, numFormatWithDashPipe, numValformatPipe, CustomPipe, ChangeCamelCasePipe, weightFormatWithKeyPipe, markerCapformatPipe, numValueformatPipe, percentformatPipe, NumformatPipe, NumWithCommaPipe, NumWithCommaPipeRtnNullDash, NullDashPipePipe, PriceFormatPipe, WeightFormatPipe, NumWithCommaPipeRtnPercent, WtFormatPerDigitPipe]
})
export class CustomModulePipeModule { }
