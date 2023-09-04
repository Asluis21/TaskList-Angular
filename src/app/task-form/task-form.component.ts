import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../task/task.service';
import { Task } from '../task/task';
import { parse, format } from 'date-fns';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { Priority } from '../task/priority';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit {

  public editMode: boolean;
  public priorities: Priority[] = [];
  private id: number=0;
  public task: Task = new Task();
  public errors: Map<string, string> = new Map<string, string>();

  constructor(private routerActive : ActivatedRoute, private router : Router, private taskService : TaskService){    
  }

  ngAfterViewInit(){
    flatpickr('#dueDate',{
      enableTime:true,
      dateFormat: 'Y-m-d H:i'
    })
  };
  
  ngOnInit():void{
    this.editMode = this.routerActive.snapshot.data['editMode'];
    
    this.taskService.findAllPriorities().subscribe((res) => this.priorities = res);

    this.routerActive.paramMap.subscribe(
      (param) => this.id = parseInt(param.get('id')) || 0 as number
    )

    if(this.id != 0) {//if(this.editMode) {
      this.FillFields();
    }else{
      this.task.dueDate = Task.getFormatDateTime(new Date());
    }

    console.log(this.id);
  }


  FillFields():void{
    this.taskService.findTaskById(this.id).subscribe(
      (taskFound) => {
        taskFound.priority = null;
        this.task = taskFound;
        console.log(this.task);
        
      }
    );
  }
  
  public onTaskSubmit():void{

    // this.task.dueDate = Task.getFormatDateTime(new Date(this.task.dueDate));

    console.log(this.task.dueDate);

    const swalWithBootstrapButtons = Swal.mixin({
      buttonsStyling: false
    })

    if(this.id != 0){

      this.taskService.editTask(this.id, this.task).subscribe({

        next: () => {
          this.errors = new Map<string, string>
          console.log(this.task);
          

          swalWithBootstrapButtons.fire({
            title: `Task '${this.task.name}' modified successfully`,
            icon: 'success'
          })

        },
        error:(err) =>{
          this.errors = new Map(Object.entries(err));
        }
      });

    }else{
      
      this.taskService.createTask(this.task).subscribe({
        next: ()=>{
          this.errors = new Map<string, string>
          this.router.navigate(['/task'])
          
          swalWithBootstrapButtons.fire({
            title: `Task '${this.task.name}' created successfully`,
            icon: 'success'
          })
        },

        error: (err) =>{
          this.errors = new Map(Object.entries(err));
        }
      });
    }
    
  }


}
