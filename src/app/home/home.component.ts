import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  message: string;

  loginForm = this.formBuilder.group({
    username: ''
  });

  constructor(
    private formBuilder: FormBuilder,
    private router: Router
    ) { }

  ngOnInit(): void {

    if(localStorage.getItem('username') != null) {
      this.router.navigate(['call']);
    }
    
    this.loginForm = this.formBuilder.group({
      username: [null, [Validators.required]],
    });
  }

  loginRequest() {
    if(this.loginForm.valid) {

      localStorage.clear();
      localStorage.setItem('username', this.loginForm.value['username']);

      this.router.navigate(['call']);

    } else {
      this.message = "Fill out the form.";
    }

  }

}
