import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.css']
})
export class SearchBarComponent implements OnInit{

  editModeExist: boolean = false;

  constructor(private activeRouter: ActivatedRoute){ }

  ngOnInit(){
    this.editModeExist = !('editMode' in this.activeRouter.snapshot.data);
  }
}
