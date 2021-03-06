// let recordbutton = document.getElementById('record');
// let stopbutton = document.getElementById('stop');
// let audioElement = document.getElementById('audio');
// let currentlyRecording = false;
// let getUserMediaStream;

//capture audio from the user's device using the built in method and the MediaStream recording API

// recordbutton.addEventListener('click', function() {
//   let options = { audio: true, video: false };
//   if (currentlyRecording === false) {
//   navigator.mediaDevices.getUserMedia(options)
//   .then(stream => {
//     currentlyRecording = true;
//     audioElement.controls = false;
//     getUserMediaStream = stream;
//     let audioContext = new AudioContext();
//     let source = audioContext.createMediaStreamSource(stream);
//     var mediaRecorder = new MediaRecorder(source);
//   mediaRecorder.start();
//   console.log(mediaRecorder.state);
//   console.log("recorder started");
//   document.getElementById('record').style.background = "red";
//   document.getElementById('record').style.color = "black";
//   }
//     )
//       }})

// stopbutton.addEventListener('click', function() {
//   mediaRecorder.stop();
//   console.log(mediaRecorder.state);
//   console.log("recorder stopped");
//   document.getElementById('record').style.background = "";
//   document.getElementById('record').style.color = "";
// });

// mediaRecorder.onstop = function(e) {
//   currentlyRecording = false;
//   let audioElementSource = window.URL.createObjectURL(blob);
//   audioElement.src = audioElementSource;
//   audioElement.controls = true;
// }.catch(function(err) {
//   console.log('The following error occurred: ' + err);
// });

//Current instrument
let curProg=0;
//Current octave
let curOct=0;
//Current note
let curNote=60;
//Current midi device (I think)
let curMidi=0;
let midiPort=[];
let currentPort=-1;
//Index of tts voice used
let voiceIndex=0;
//Boolean to indicate if user is in
//command monde.
let inCommandMode=0;
//Record of MIDI events
let noteRecord=[];
//Object of active notes
let activeNotes={};
let tracks = [];
let curTrackIndex = 0;
let inRecordMode = false;
let enableVoiceChange = true;
let useMic = false;

Init = () => {
	//Initialize MIDI devices
	InitMidi();
	//Synthesizer element
	synth=document.getElementById("tinysynth");
	//keyboard element
	kb=document.getElementById("kb");
	//Add listener to keyboard to change notes properly
	kb.addEventListener("change", KeyIn);
	let sh=document.getElementById("shot");
	/*When synth has loaded, add event listener that 
	 *sends the current note to the audio output when
	 *the button on the bottom left hand corner is clicked.*/
	synth.ready().then(() => {
		sh.addEventListener("mousedown", () => {
			synth.send([0x90+curMidi,curNote,100],0);
		});
		sh.addEventListener("mouseup", () => {
			synth.send([0x80+curMidi,curNote,100],0);
		});
		/*Append each instrument to list in dropdown menu*/
		for(let i=0;i<128;++i){
			let o=document.createElement("option");
			o.innerHTML=(i+1)+" : "+synth.getTimbreName(0,i);
			document.getElementById("prog").appendChild(o);
		}
		/*Default to instrument 0*/
		ProgChange(0);
	});
}

//Change MIDI channel
function ChChange(e){
	curMidi=e.selectedIndex;
}

//Changes the octave, unsurprisingly.
function OctChange(o){
	curOct=o;
}

function ProgChange(p){
	if(synth){
		synth.send([0xc0,p]);
		if(curMidi!=9){
			curProg=p;
			let pg=synth.program[curProg];
			//ViewParam(pg);
		}
	}
}

function Sustain(b){
	synth.send([0xb0+curMidi,64,b?127:0],0);
}

//Run on page load
window.onload=()=>{

	//initialize TTS engine and voices
	initSpeech();
	//Initialize MIDI and tinysynth.
	Init();
	//Assign keybindings for program
	BindKeys();

	//Give focus to keyboard
	document.querySelector("#kb").focus();

	utter("Welcome to the Digital Audio Workstation", voiceIndex);
}

//function ViewDef(pg){
//  let s=JSON.stringify(pg.p);
//  s=s.replace(/}/g,",}").replace(/\"([a-z])\"/g,"$1");
//  let ss=["g:0,","t:1,","f:0,","v:0.5,","a:0,","h:0.01,","d:0.01,","s:0,","r:0.05,","p:1,","q:1","k:0"];
//  for(p=0;p<ss.length;++p){
//    s=s.replace(ss[p],",");
//    s=s.replace(ss[p],",");
//    s=s.replace(ss[p],",");
//  }
//  s=s.replace(/{,/g,"{");
//  s=s.replace(/,+/g,",");
//  document.getElementById("patch").value=s;
//}
//function About(){
//  let el=document.getElementById("aboutcontents");
//  console.log(el.style.height)
//  if(el.style.height==""||el.style.height=="0px"){
//    el.style.height="400px";
//    el.style.padding="20px 20px";
//  }
//  else{
//    el.style.height="0px";
//    el.style.padding="0px 20px";
//  }
//}

//function SetQuality(n){
//  let pg;
//  synth.quality=n;
//  if(curMidi==9)
//    pg=synth.drummap[curNote];
//  else
//    pg=synth.program[curProg];
//  ViewParam(pg);
//}
//
//function GetVal(id){
//  let s=+document.getElementById(id).value;
//  if(isNaN(s))
//    s=0;
//  return s;
//}
//function Edit(){
//  if(window.synth==undefined)
//    return;
//  let prog;
//  if(curMidi==9)
//    prog=synth.drummap[curNote-35];
//  else
//    prog=synth.program[curProg];
//  let oscs=document.getElementById("oscs").selectedIndex+1;
//  EnableRow();
//  if(prog.p.length>oscs)
//    prog.p.length=oscs;
//  if(prog.p.length<oscs)
//    for(let i=oscs-prog.p.length;i>=0;--i)
//      prog.p.push({g:0,w:"sine",v:0,t:0,f:0,a:0,h:0,d:1,s:0,r:1,b:0,c:0,p:1,q:1,k:0});
//  for(let i=0;i<oscs;++i){
//    prog.p[i].g=GetVal("g"+(i+1));
//    prog.p[i].w=document.getElementById("w"+(i+1)).value;
//    prog.p[i].v=GetVal("v"+(i+1));
//    prog.p[i].t=GetVal("t"+(i+1));
//    prog.p[i].f=GetVal("f"+(i+1));
//    prog.p[i].a=GetVal("a"+(i+1));
//    prog.p[i].h=GetVal("h"+(i+1));
//    prog.p[i].d=GetVal("d"+(i+1));
//    prog.p[i].s=GetVal("s"+(i+1));
//    prog.p[i].r=GetVal("r"+(i+1));
//    prog.p[i].p=GetVal("p"+(i+1));
//    prog.p[i].q=GetVal("q"+(i+1));
//    prog.p[i].k=GetVal("k"+(i+1));
//  }
//  ViewDef(prog);
//}
//function OpenEditor(){
//  let e=document.getElementById("soundeditor");
//  if(e.style.display=="block")
//    e.style.display="none";
//  else
//    e.style.display="block";
//}
//function Ctrl(){
//  if(typeof(synth)!="undefined"){
//    synth.masterVol=document.getElementById("vol").value;
//    synth.reverbLev=document.getElementById("rev").value;
//    synth.loop=document.getElementById("loop").value;
//  }
//}
//function EnableRow(){
//  oscs=document.getElementById("oscs").selectedIndex+1;
//  for(let i=2;;++i){
//    let o=document.getElementById("osc"+i)
//    if(!o)
//      break;
//    ids=["g","w","v","t","f","a","h","d","s","r","p","q","k"];
//    for(id=0;id<ids.length;++id){
//      document.getElementById(ids[id]+i).disabled=(oscs>=i)?false:true;
//      document.getElementById(ids[id]+i).style.background=(oscs>=i)?"#fff":"#ccc";
//    }
//  }
//}

//function ViewParam(pg){
//  if(!pg)
//    return;
//  let oscs=pg.p.length;
//  document.getElementById("oscs").selectedIndex=oscs-1;
//  let o=document.getElementById("osc2").firstChild;
//  while(o=o.nextSibling){
//    if(o.firstChild)
//      o.firstChild.disabled=(oscs>=2)?false:true;
//  }
//  o=document.getElementById("osc3").firstChild;
//  while(o=o.nextSibling){
//    if(o.firstChild)
//      o.firstChild.disabled=(oscs>=3)?false:true;
//  }
//  o=document.getElementById("osc4").firstChild;
//  while(o=o.nextSibling){
//    if(o.firstChild)
//      o.firstChild.disabled=(oscs>=4)?false:true;
//  }
//  document.getElementById("name").innerHTML=pg.name+" : ";
//  for(let i=0;i<oscs;++i){
//    document.getElementById("g"+(i+1)).value=pg.p[i].g;
//    document.getElementById("w"+(i+1)).value=pg.p[i].w;
//    document.getElementById("v"+(i+1)).value=pg.p[i].v;
//    document.getElementById("t"+(i+1)).value=pg.p[i].t;
//    document.getElementById("f"+(i+1)).value=pg.p[i].f;
//    document.getElementById("a"+(i+1)).value=pg.p[i].a;
//    document.getElementById("h"+(i+1)).value=pg.p[i].h;
	//    document.getElementById("d"+(i+1)).value=pg.p[i].d;
//    document.getElementById("s"+(i+1)).value=pg.p[i].s;
//    document.getElementById("r"+(i+1)).value=pg.p[i].r;
//    document.getElementById("p"+(i+1)).value=pg.p[i].p;
	//    document.getElementById("q"+(i+1)).value=pg.p[i].q;
//    document.getElementById("k"+(i+1)).value=pg.p[i].k;
//  }
//  ViewDef(pg);
//}
