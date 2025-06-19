import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client";
import { Badge, IconButton, TextField } from '@mui/material';
import { Button } from '@mui/material';
import VideocamIcon from '@mui/icons-material/Videocam';
import VideocamOffIcon from '@mui/icons-material/VideocamOff'
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from '@mui/icons-material/CallEnd'
import MicIcon from '@mui/icons-material/Mic'
import MicOffIcon from '@mui/icons-material/MicOff'
import ScreenShareIcon from '@mui/icons-material/ScreenShare';
import StopScreenShareIcon from '@mui/icons-material/StopScreenShare'
import ChatIcon from '@mui/icons-material/Chat'
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CloseIcon from '@mui/icons-material/Close';
import server from '../environment';
import '../styles/videomeet.css';
import '../styles/videomeet.mobile.css';

const server_url = server;

var connections = {};

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

export default function VideoMeetComponent() {

    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(false);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

    let [showMobileOptions, setShowMobileOptions] = useState(false);

    // TODO
    // if(isChrome() === false) {


    // }

    // Fix: Prevent getPermissions from running on every render and resetting video/audio
    const getPermissions = React.useCallback(async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }, [videoAvailable, audioAvailable]);

    let getDislayMedia = React.useCallback(() => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }, [screen])

    // Fix: Wrap getUserMedia in useCallback
    const getUserMedia = React.useCallback(() => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }, [video, audio, videoAvailable, audioAvailable]);

    // Fix: Prevent getPermissions from running on every render and resetting video/audio
    useEffect(() => {
        getPermissions();
    }, [getPermissions]); // Add getPermissions to dependencies

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);
        }
    }, [video, audio, getUserMedia]); // Added getUserMedia to dependencies
    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }




    let connectToSocketServer = () => {
        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', window.location.href)
            socketIdRef.current = socketRef.current.id

            socketRef.current.on('chat-message', addMessage)

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on('user-joined', (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections)
                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }))
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };


                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()])
                        window.localStream = blackSilence()
                        connections[socketListId].addStream(window.localStream)
                    }
                })

                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        if (localVideoref.current && localVideoref.current.srcObject) {
            const videoTrack = localVideoref.current.srcObject.getVideoTracks()[0];
            if (videoTrack) {
                if (videoTrack.enabled) {
                    videoTrack.enabled = false;
                    setVideo(false);
                } else {
                    navigator.mediaDevices.getUserMedia({ video: true, audio: audio })
                        .then(stream => {
                            const newTrack = stream.getVideoTracks()[0];
                            const oldStream = localVideoref.current.srcObject;
                            // Remove old video track
                            oldStream.getVideoTracks().forEach(track => oldStream.removeTrack(track));
                            // Add new video track
                            oldStream.addTrack(newTrack);
                            setVideo(true);
                        });
                }
            } else {
                setVideo(v => !v);
            }
        } else {
            setVideo(v => !v);
        }
    }
    let handleAudio = () => {
        setAudio(!audio)
        // getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen, getDislayMedia]); // Add getDislayMedia to dependencies
    let handleScreen = () => {
        if (screen) {
            // If currently sharing screen, stop all display media tracks
            if (localVideoref.current && localVideoref.current.srcObject) {
                const tracks = localVideoref.current.srcObject.getTracks();
                tracks.forEach(track => {
                    // Only stop display media tracks
                    if (track.kind === 'video' && track.label.toLowerCase().includes('screen')) {
                        track.stop();
                    }
                });
            }
            setScreen(false);
            // Switch back to webcam
            getUserMedia();
        } else {
            setScreen(true);
        }
    }

    let handleEndCall = () => {
        try {
            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/"
    }

    const addMessage = (data, sender, socketIdSender) => {
        setMessages((prevMessages) => [
            ...prevMessages,
            {
                sender: sender,
                data: data,
                isMe: socketIdSender === socketIdRef.current // Mark as 'me' if sender is this client
            }
        ]);
        if (socketIdSender !== socketIdRef.current) {
            setNewMessages((prevNewMessages) => prevNewMessages + 1);
        }
    };

    let sendMessage = () => {
        socketRef.current.emit('chat-message', message, username);
        setMessage("");
    }

    
    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    // Replace handleChatIconClick to also close mobile options
    const handleChatIconClick = () => {
        setModal(!showModal);
        setShowMobileOptions(false);
        setNewMessages(0);
    };

    // Close popup when clicking outside
    useEffect(() => {
        if (!showMobileOptions) return;
        const handleClick = (e) => {
            const popup = document.querySelector('.videomeet-mobile-popup-inner');
            if (popup && !popup.contains(e.target)) {
                setShowMobileOptions(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        // Prevent background scroll
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.body.style.overflow = '';
        };
    }, [showMobileOptions]); // No missing dependencies

    // Add closeChat function for chat modal
    const closeChat = () => {
        setModal(false);
    };

    const chatEndRef = useRef(null);

    // Scroll to bottom of chat when a new message is received
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    return (
        <div className="videomeet-bg" style={{ width: '100vw', minHeight: '100vh', overflow: 'hidden' }}>
            {askForUsername === true ? (
                <div className='vcall-container'>
                    <h2 className='vcall-title'>Enter into Lobby </h2>
                    <div className="vcall-form-group">

                    <TextField id="outlined-basic" className='vcall-input' label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />
                    <Button variant="contained" className='vcall-button' onClick={connect}>Connect</Button>
                    </div>
                    <div className='vcall-video-container'>
                        <video className='vcall-video' ref={localVideoref} autoPlay muted></video>
                    </div>
                </div>
            ) : (
                <div className={styles.meetVideoContainer + " videomeet-main"} style={{ display: 'flex', flexDirection: 'row', width: '100vw', maxWidth: '100vw', overflow: 'hidden', alignItems: 'stretch', justifyContent: 'space-between' }}>
                    {/* Video and controls section */}
                    <div style={{ flex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minWidth: 0 }}>
                        <video
                            className={styles.meetUserVideo}
                            ref={localVideoref}
                            autoPlay
                            muted
                            style={{ background: !video ? '#181828' : 'transparent', objectFit: 'cover' }}
                        />
                        <div className={styles.conferenceView}>
                            {videos.map((video) => (
                                <div key={video.socketId}>
                                    <video
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                    />
                                </div>
                            ))}
                        </div>
                        <div className={styles.buttonContainers + " videomeet-controls desktop-only"} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem', margin: '1.5rem 0' }}>
                            <IconButton onClick={handleVideo} style={{ color: "white" }}>
                                {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
                            </IconButton>
                            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                                <CallEndIcon />
                            </IconButton>
                            <IconButton onClick={handleAudio} style={{ color: "white" }}>
                                {audio === true ? <MicIcon /> : <MicOffIcon />}
                            </IconButton>
                            {screenAvailable === true ? (
                                <IconButton onClick={handleScreen} style={{ color: "white" }}>
                                    {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
                                </IconButton>
                            ) : null}
                            {newMessages > 0 ? (
                                <Badge badgeContent={newMessages} max={999} color='orange'>
                                    <IconButton onClick={handleChatIconClick} style={{ color: "white" }}>
                                        <ChatIcon />
                                    </IconButton>
                                </Badge>
                            ) : (
                                <IconButton onClick={handleChatIconClick} style={{ color: "white" }}>
                                    <ChatIcon />
                                </IconButton>
                            )}
                        </div>
                        {/* Mobile bottom bar */}
                        <div className="videomeet-mobile-bottombar mobile-only">
                            {!showModal && <>
                                <IconButton onClick={handleEndCall} style={{ color: "red" }}>
                                    <CallEndIcon />
                                </IconButton>
                                <IconButton onClick={() => setShowMobileOptions(true)} style={{ color: "white" }}>
                                    <MoreVertIcon />
                                </IconButton>
                            </>}
                        </div>
                        {/* Mobile bottom popup for more options */}
                        <div className={
  `videomeet-mobile-popup${showMobileOptions && !showModal ? ' videomeet-mobile-popup-open' : ' videomeet-mobile-popup-closed'}`
}>
  <div className="videomeet-mobile-popup-inner">
    <IconButton onClick={handleVideo} style={{ color: "white" }}>
      {(video === true) ? <VideocamIcon /> : <VideocamOffIcon />}
    </IconButton>
    <IconButton onClick={handleAudio} style={{ color: "white" }}>
      {audio === true ? <MicIcon /> : <MicOffIcon />}
    </IconButton>
    {screenAvailable === true ? (
      <IconButton onClick={handleScreen} style={{ color: "white" }}>
        {screen === true ? <ScreenShareIcon /> : <StopScreenShareIcon />}
      </IconButton>
    ) : null}
    <IconButton onClick={handleChatIconClick} style={{ color: "white" }}>
      <ChatIcon />
    </IconButton>
    <IconButton onClick={() => setShowMobileOptions(false)} style={{ color: "white" }}>
      <CloseIcon />
    </IconButton>
  </div>
</div>
                    </div>
                    {/* Chat section as overlay for all views */}
                    <div
                        className={
                            styles.chatRoom +
                            " videomeet-chat videomeet-chat-right" +
                            (window.innerWidth <= 600 ? ' videomeet-mobile-sidebar' : '') +
                            (showModal ? ' videomeet-chat-open' : ' videomeet-chat-closed')
                        }
                        style={{
                            minWidth: 320,
                            maxWidth: 400,
                            width: '100%',
                            height: '100vh',
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            zIndex: 1000,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-end',
                            background: '#181828',
                            borderLeft: '2px solid #a259ff',
                            boxShadow: '-8px 0 32px #a259ff22',
                        }}
                    >
                        {/* Mobile close icon */}
                        {window.innerWidth <= 600 ? (
                            <IconButton className="videomeet-mobile-sidebar-close" onClick={closeChat} style={{ color: "#fff", alignSelf: 'flex-end' }}>
                                <CloseIcon />
                            </IconButton>
                        ) : null}
                        <div className={styles.chatContainer + " videomeet-chat-inner custom-scrollbar"} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div className="videomeet-chat-header-row">
                                <h1 className="videomeet-chat-header">Chat</h1>
                                {window.innerWidth > 600 && (
                                    <IconButton className="videomeet-desktop-sidebar-close" onClick={closeChat}>
                                        <CloseIcon />
                                    </IconButton>
                                )}
                            </div>
                            <div className={styles.chattingDisplay + " videomeet-chat-messages"} style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem' }}>
                                {messages.length !== 0 ? messages.map((item, index) => (
                                    <div style={{ marginBottom: "20px" }} key={index} className={"videomeet-chat-message" + (item.isMe ? " me" : "") }>
                                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                                        <p>{item.data}</p>
                                    </div>
                                )) : <p className="videomeet-chat-message">No Messages Yet</p>}
                                <div ref={chatEndRef} />
                                <div className='input-gap'></div>
                            </div>
                            <div className={styles.chattingArea + " videomeet-chat-input"}>
                                <TextField
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            sendMessage();
                                        }
                                    }}
                                    id="outlined-basic"
                                    label="Enter Your chat"
                                    variant="outlined"
                                />
                                <Button variant='contained' onClick={sendMessage}>Send</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
