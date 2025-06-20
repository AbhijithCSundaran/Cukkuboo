import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'durationFormat'
})
export class DurationFormatPipe implements PipeTransform {

   transform(value: number): string {
    if (value == null || value < 0) return '0 mins';

    const hours = Math.floor(value / 60);
    const minutes = value % 60;

    let result = '';
    if (hours > 0) {
      result += `${hours}hr`;
      if (minutes > 0) {
        result += ` ${minutes} mins`;
      }
    } else {
      result = `${minutes} mins`;
    }

    return result;
  }


}
