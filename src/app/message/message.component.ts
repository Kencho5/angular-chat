import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CallService } from '../call/call.service';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css']
})
export class MessageComponent implements OnInit {
  username = localStorage.getItem("username");
  users = [];
  private peerId: string;

  constructor(private router: Router, private callService: CallService) { 
    this.peerId = this.callService.initPeer();
  }

  ngOnInit(): void {
    if(this.username == null) {
      this.router.navigate(['']);
    }

    const data = {
      username: localStorage.getItem("username"),
      id: this.peerId
    }

    this.callService.userOnline(data).subscribe((res) => {
      if(res["code"] == 200) {
        console.log(res["message"]);
      }
    });

    this.callService.users().subscribe((res) => {
      if(res["code"] == 200) {
        this.users = res["users"];
      }
    });
  }

  public connectUser(element): void {
    var toMessage = element.target.id;

    this.callService.getUserId({username: toMessage}).subscribe((res) => {
      if(res["code"] == 200) {
        var callId = res["id"];
        this.callService.establishChat(callId);
      }
    });

  }

  sendMessage() {
    var message = (<HTMLInputElement>document.getElementById("message-input")).value;
  }

  public onClose() {
    this.callService.userOffline({username: localStorage.getItem("username")}).subscribe((res) => {
      if(res["code"] == 200) {
        console.log(res["message"]);
      }
    });
  }
  

}
