import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../task/task.service';
import { Task } from '../task/task';
import flatpickr from 'flatpickr';
import Swal from 'sweetalert2';
import { Priority } from '../task/priority';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.css']
})
export class TaskFormComponent implements OnInit, OnDestroy {

  public priorities: Priority[] = [];
  public task: Task = new Task();
  public errors: Map<string, string> = new Map<string, string>();
  public flatpickrIntance : flatpickr.Instance;

  constructor(private routerActive : ActivatedRoute, private router : Router, private taskService : TaskService){    
  }
  
  ngOnInit():void{
    this.initFlatpickr();

    this.taskService.findAllPriorities().subscribe((res) => this.priorities = res);

    this.routerActive.paramMap.subscribe(
      (param) => this.task.id = parseInt(param.get('id')) || 0 as number
    )

    if(this.task.id > 0) {
      this.FillFields();
    }else{
      this.task.dueDate = Task.getFormatDateTime(new Date());
    }
  }

  ngOnDestroy(): void {
    this.destroyFlatpickr();
  }


  FillFields():void{
    this.taskService.findTaskById(this.task.id).subscribe(
      (taskFound) => {
        this.task = taskFound;
        console.log(this.task);
      }
    );
  }
  
  public onTaskSubmit():void{

    console.log(this.task.dueDate);

    const swalWithBootstrapButtons = Swal.mixin({
      buttonsStyling: false
    })

    if(this.task.id != 0){

      this.taskService.editTask(this.task.id, this.task).subscribe({

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

  private initFlatpickr(){
    const datetimeFilter  = document.getElementById('dueDate') as HTMLInputElement;

    if (datetimeFilter ){
       this.flatpickrIntance = flatpickr(datetimeFilter, {
        enableTime:true,
        dateFormat: 'Y-m-d H:i'
       });
    }
  }

  private destroyFlatpickr(){
    if(this.destroyFlatpickr){
      this.flatpickrIntance.destroy();
    }
  }

  public deleteTask(){

    const swalWithBootstrapButtons = Swal.mixin({
      buttonsStyling: false
    })
    
    swalWithBootstrapButtons.fire({
      title: 'Are you sure to delete?',
      text: "You won't be able to revert this!",
      icon: 'question',
      showCancelButton: true,
      cancelButtonText: 'No, cancel!',
      confirmButtonText: 'Yes, delete them!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        
        this.taskService.deleteTaskById(this.task.id).subscribe({
          next:()=>console.log("task " + this.task.id + " deleted"),
          error:(err)=>console.log(err)
        })
        
        swalWithBootstrapButtons.fire(
          'Deleted!',
          'The task have been deleted.',
          'success'
        )

        this.router.navigate(['/task']);
      }
    })
    

  }
}
