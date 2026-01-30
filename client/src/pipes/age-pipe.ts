import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dobToAge',
})
export class AgePipe implements PipeTransform {

  transform(value: string): number {
    const dob = new Date(value);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    let monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && (today.getDate() < dob.getDate()))) {
      age--;
    }
    return age;
  }

}
