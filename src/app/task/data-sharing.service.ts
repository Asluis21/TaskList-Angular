import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataSharingService {

  private inputValueSubject = new BehaviorSubject<string>('');
  inputValue$ = this.inputValueSubject.asObservable();

  setInputValue(value:string){
    console.log("value : " + value);
    
    this.inputValueSubject.next(value);
    console.log(this.inputValue$);
    
  }

  constructor() { }
}
