import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DataService {

 
  private paramData: any;
  constructor() {

  }

  setParamData(data){
    this.paramData = data;
    console.log(JSON.stringify(this.paramData) + ' selected from service');


  }

  getParamData() {
    return this.paramData;
  }
}