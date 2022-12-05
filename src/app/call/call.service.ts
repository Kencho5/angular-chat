import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Peer, MediaConnection, PeerJSOption } from 'peerjs';
import { BehaviorSubject, Subject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { HttpClient, HttpResponse} from '@angular/common/http';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CallService {
    
    private peer: Peer;
    private mediaCall: MediaConnection;
    
    private localStreamBs: BehaviorSubject<MediaStream> = new BehaviorSubject(null);
    public localStream$ = this.localStreamBs.asObservable();
    private remoteStreamBs: BehaviorSubject<MediaStream> = new BehaviorSubject(null);
    public remoteStream$ = this.remoteStreamBs.asObservable();
    
    private isCallStartedBs = new Subject<boolean>();
    public isCallStarted$ = this.isCallStartedBs.asObservable();
    
    constructor(private snackBar: MatSnackBar, 
        private _http: HttpClient
        ) { }

    public initPeer(): string {
        if (!this.peer || this.peer.disconnected) {
            const peerJsOptions: PeerJSOption = {
                debug: 3,
                config: {
                    iceServers: [
                        {
                            urls: [
                                'stun:stun1.l.google.com:19302',
                                'stun:stun2.l.google.com:19302',
                            ],
                        }]
                }
            };
            try {
                let id = uuidv4();
                this.peer = new Peer(id, peerJsOptions);
                return id;
            } catch (error) {
                console.error(error);
            }
        }
    }

    public establishChat(remotePeerId: string) {
        const conn = this.peer.connect(remotePeerId);

        conn.on('open', function() {
			conn.on('data', function(data) {
				console.log('Receiveddd', data);
			});
            conn.send('Hello from phone!');
		});		
    }

    public async establishMediaCall(remotePeerId: string) {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const conn = this.peer.connect(remotePeerId);
            
            this.mediaCall = this.peer.call(remotePeerId, stream);

            this.localStreamBs.next(stream);
            this.isCallStartedBs.next(true);
            this.mediaCall.on('stream',
                (remoteStream) => {
                    this.remoteStreamBs.next(remoteStream);
                });
            this.mediaCall.on('close', () => this.onCallClose());
        }
        catch (ex) {
            console.error(ex);
            this.snackBar.open(ex, 'Close');
            this.isCallStartedBs.next(false);
        }
    }

    public async enableCallAnswer() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            this.localStreamBs.next(stream);
            this.peer.on('call', async (call) => {
    
                this.mediaCall = call;
                this.isCallStartedBs.next(true);
    
                this.mediaCall.answer(stream);
                this.mediaCall.on('stream', (remoteStream) => {
                    this.remoteStreamBs.next(remoteStream);
                });
                this.mediaCall.on('error', err => {
                    this.snackBar.open('Close');
                    this.isCallStartedBs.next(false);
                    console.error(err);
                });
                this.mediaCall.on('close', () => this.onCallClose());
            });            
        }
        catch (ex) {
            console.error(ex);
            this.snackBar.open(ex, 'Close');
            this.isCallStartedBs.next(false);            
        }
    }

    private onCallClose() {
        this.remoteStreamBs?.value.getTracks().forEach(track => {
            track.stop();
        });
        this.localStreamBs?.value.getTracks().forEach(track => {
            track.stop();
        });
        this.snackBar.open('Call Ended', 'Close');
    }

    public closeMediaCall() {
        this.mediaCall?.close();
        if (!this.mediaCall) {
            this.onCallClose()
        }
        this.isCallStartedBs.next(false);
    }

    public destroyPeer() {
        this.mediaCall?.close();
        this.peer?.disconnect();
        this.peer?.destroy();
    }

    public userOnline(data) {
        return this._http.post('/api/online', data).pipe(
            map((res: HttpResponse<Response>) => {
            return res;
        }));
    }

    public userOffline(data) {
        return this._http.post('/api/offline', data).pipe(
            map((res: HttpResponse<Response>) => {
            return res;
        }));
    }

    public users() {
        return this._http.post('/api/users', {}).pipe(
            map((res: HttpResponse<Response>) => {
            return res;
        }));
    }

    public getUserId(data) {
        return this._http.post('/api/id', data).pipe(
            map((res: HttpResponse<Response>) => {
            return res;
        }));
    }

}