import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataSharingService } from '../task/data-sharing.service';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit{

  editModeExist: boolean = false;
  inputValue : string = '';

  constructor(private activeRouter: ActivatedRoute, private dataSharingService:DataSharingService){ }

  ngOnInit(){
    this.editModeExist = !('editMode' in this.activeRouter.snapshot.data);
  }

  onInputChange(){
    this.dataSharingService.setInputValue(this.inputValue);
  }
}
