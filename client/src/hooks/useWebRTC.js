import { useEffect, useRef, useState } from 'react';
import Peer from 'simple-peer';
import toast from 'react-hot-toast';
import { Howl } from 'howler';

const useWebRTC = ({ socket, authUser, selectedUser }) => {
    const myVideo = useRef(null);
    const connectionRef = useRef(null);
    const hasJoined = useRef(false);

    const [stream, setStream] = useState(null);
    const [remoteStream, setRemoteStream] = useState(null);

    const [incomingCall, setIncomingCall] = useState(false);
    const [callerInfo, setCallerInfo] = useState(null);
    const [callerSignal, setCallerSignal] = useState(null);
    const [callAccepted, setCallAccepted] = useState(false);
    const [waitingForAnswer, setWaitingForAnswer] = useState(false);
    const [callRejectedPopUp, setCallRejectedPopUp] = useState(false);
    const [rejectorData, setRejectorData] = useState(null);

    const [isMicOn, setIsMicOn] = useState(true);
    const [isCamOn, setIsCamOn] = useState(true);



    const ringtone = useRef(
        new Howl({
            src: ['/ringtone.mp3'],
            loop: true,
            volume: 1.0,
        })
    );

    useEffect(() => {
        if (!authUser || !socket || hasJoined.current) return;

        socket.emit('join', { id: authUser._id, name: authUser.fullName });
        hasJoined.current = true;

        socket.on('me', () => { });

        socket.on('callToUser', ({ from, name, signal }) => {
            setIncomingCall(true);
            setCallerInfo({ from, name });
            setCallerSignal(signal);
            ringtone.current.play();
        });

        socket.on('callRejected', (data) => {
            setCallRejectedPopUp(true);
            setRejectorData(data);
            ringtone.current.stop();
        });

        socket.on('callEnded', () => {
            ringtone.current.stop();
            endCallCleanup();
        });

        socket.on('userUnavailable', (data) => toast.error(data.message || 'User unavailable'));
        socket.on('userBusy', (data) => toast.error(data.message || 'User is busy'));

        return () => {
            socket.off('me');
            socket.off('callToUser');
            socket.off('callRejected');
            socket.off('callEnded');
            socket.off('userUnavailable');
            socket.off('userBusy');
        };
    }, [authUser, socket]);

    useEffect(() => {
        if (myVideo.current && stream) {
            myVideo.current.srcObject = stream;
        }
    }, [stream]);

    useEffect(() => {
        if (myVideo.current && stream) {
            myVideo.current.srcObject = stream;
        }
    }, [myVideo.current, stream, callAccepted]);


    useEffect(() => {
        console.log("myVideo ref:", myVideo?.current);
        console.log("Local stream:");
    }, [myVideo]);

    const callUser = async () => {
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(localStream);

            const peer = new Peer({
                initiator: true,
                trickle: false,
                stream: localStream,
            });

            peer.on('signal', (signalData) => {
                socket.emit('callToUser', {
                    callToUserId: selectedUser._id,
                    signalData,
                    from: authUser._id,
                    name: authUser.fullName,
                    email: authUser.email,
                    profilepic: authUser.profilepic,
                });
            });

            peer.on('stream', (remoteStream) => {
                setRemoteStream(remoteStream); // ✅ Set the remote stream
            });

            socket.once('callAccepted', ({ signal }) => {
                setCallAccepted(true);
                setWaitingForAnswer(false);
                peer.signal(signal);
            });

            connectionRef.current = peer;
            setWaitingForAnswer(true);
            setCallRejectedPopUp(false);
        } catch (err) {
            toast.error('Camera or microphone access denied.');
            console.error('getUserMedia error:', err);
        }
    };

    const answerCall = async () => {
        ringtone.current.stop();
        try {
            const localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(localStream);
            setCallAccepted(true);
            setIncomingCall(false);

            const peer = new Peer({
                initiator: false,
                trickle: false,
                stream: localStream,
            });

            peer.on('signal', (signalData) => {
                socket.emit('answeredCall', {
                    signal: signalData,
                    from: authUser._id,
                    to: callerInfo?.from,
                });
            });

            peer.on('stream', (remoteStream) => {
                setRemoteStream(remoteStream); // ✅ Set the remote stream
            });

            if (callerSignal) {
                peer.signal(callerSignal);
            }

            connectionRef.current = peer;
        } catch (err) {
            toast.error('Camera or microphone access denied.');
            console.error('getUserMedia error:', err);
        }
    };

    const rejectCall = () => {
        ringtone.current.stop();
        setIncomingCall(false);
        setCallAccepted(false);
        setWaitingForAnswer(false);

        socket.emit('reject-call', {
            to: callerInfo?.from,
            name: authUser.fullName,
            profilepic: authUser.profilepic,
        });
    };

    const endCall = () => {
        ringtone.current.stop();

        socket.emit('call-ended', {
            to: callerInfo?.from || selectedUser._id,
            name: authUser.fullName,
        });

        endCallCleanup();
    };

    const endCallCleanup = () => {
        if (stream) stream.getTracks().forEach(track => track.stop());
        connectionRef.current?.destroy();
        ringtone.current.stop();

        setIncomingCall(false);
        setCallAccepted(false);
        setWaitingForAnswer(false);
        setStream(null);
        setRemoteStream(null);

        // setTimeout(() => window.location.reload(), 100);
    };

    const toggleMic = () => {
        if (!stream) return;
        const audioTrack = stream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !isMicOn;
            setIsMicOn(audioTrack.enabled);
        }
    };

    const toggleCam = () => {
        if (!stream) return;
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !isCamOn;
            setIsCamOn(videoTrack.enabled);
        }
    };

    return {
        myVideo,
        callerInfo,
        remoteStream, // ✅ Return remote stream instead of remoteVideo ref
        incomingCall,
        callAccepted,
        callRejectedPopUp,
        rejectorData,
        isMicOn,
        isCamOn,
        waitingForAnswer,
        callUser,
        answerCall,
        rejectCall,
        endCall,
        toggleMic,
        toggleCam,
    };
};

export default useWebRTC;
