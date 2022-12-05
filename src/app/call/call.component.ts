import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Observable, of } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { CallService } from './call.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.css']
})
export class CallComponent implements OnInit {
  username = localStorage.getItem("username");
  users = [];

  public isCallStarted$: Observable<boolean>;
  private peerId: string;

  @ViewChild('localVideo') localVideo: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo: ElementRef<HTMLVideoElement>;

  constructor(private callService: CallService, private router: Router) {
    this.isCallStarted$ = this.callService.isCallStarted$;
    this.peerId = this.callService.initPeer();
  }
  
  ngOnInit(): void {
    if(this.username == null) {
      this.router.navigate(['']);
    }

    this.callService.localStream$
      .pipe(filter(res => !!res))
      .subscribe(stream => this.localVideo.nativeElement.srcObject = stream)
    this.callService.remoteStream$
      .pipe(filter(res => !!res))
      .subscribe(stream => this.remoteVideo.nativeElement.srcObject = stream)

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
  
  ngOnDestroy(): void {
    this.callService.destroyPeer();
  }

  public showModal(element): void {
    var toCall = element.target.id;

    this.callService.getUserId({username: toCall}).subscribe((res) => {
      if(res["code"] == 200) {
        var callId = res["id"];
        this.callService.establishMediaCall(callId);
        this.callService.enableCallAnswer();
      }
    });

  }

  public onClose() {
    this.callService.userOffline({username: localStorage.getItem("username")}).subscribe((res) => {
      if(res["code"] == 200) {
        console.log(res["message"]);
      }
    });
  }

  public endCall() {
    this.callService.closeMediaCall();
  }
  
}
