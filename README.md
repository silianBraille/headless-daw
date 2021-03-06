Project by Shayan Dolikhani, Austin McGee, and Graham Trogdon

Demo located at http://silianbraille.github.io/headless-daw

<h1>GUIDE</h1>
<h2>Introduction</h2>
Within computing, an application that is said to be "headless" is one that does not possess a graphical user interface. Our "headless DAW," or headless digital audio workstation, is actually a misnomer, as it contains such an interface for the sake of providing feedback to our more visual users, but this feature is not necessary for our application to work as intended.
The goal of the DAW, and the reason for its name, is the for it to be entirely audio and keyboard driven, requiring no need to see the screen in order to navigate around the program. Because a digital audio workstation has many options while working within it, it is the case that there was a need to be creative when designing keyboard shortcuts, especially since the web browser already has many predefined shortcuts already that it would be irresponsible to attempt to overwrite.
With this in mind, we are using a "modal" editing system, where we can utilize the same keys for multiple tasks by having the user edit in different "modes." The DAW starts out in "Music Mode," which is where the majority of keyboard input is used to produce sound in the application, whereas "Command Mode" is used to issue commands to the application such is importing a MIDI file, toggling Record/Stop for an instrument track, and so on.
These modes are toggled in between through `semicolon` or `;`, as it is on the home row on the keyboard, meaning it does not require much strain to access in order to switch modes.
While it is more than possible to control the application through the mouse, even being able to click on the piano keys with the cursor, we encourage you to adopt this keyboard-centric means of navigating the application.

<h2>Keyboard Shortcuts</h2>
<h3>Music Mode</h3>
Please note that the musical note keybindings for QWERTY
keyboards is a work in progress--best design for these 
keybindings is still being worked out, as can seen by
some of the irregularities below.

![Music Mode Keybindings](https://github.com/silianBraille/headless-daw/blob/master/music_mode_guide.png)

The following are the sparingly used commands in Music Mode
that are most appropriate due to the immediate nature of the 
action. It would be a problem if these were accessed in command mode.

| Key		    | Usage		    		  				  	  |
| ------------- | ------------- 		  				  	  |
| `;`		    | Change to *Command Mode*  				  |
| `f`		    | Refocus to keyboard in case focus is lost   |
| `Shift (hold)`| Sustain the note  		  				  |
| `Up Arrow`	| Cycle up an octave  		  				  |
| `Down Arrow`	| Cycle down an octave  		  			  |

<h3>Command Mode</h3>

| Key		    | Usage		    		  				  						|
| ------------- | ------------- 		  				  						|
| `;`		    | Change to *Music Mode*  				  						|
| `f`		    | Refocus to keyboard in case focus is lost  				  	|
| `v`			| Cycle TTS voice  		  				  						|
| `o`			| Import MIDI file  	  				  						|
| `r`			| Begin recording track. Switches back to Music Mode for you.	|
| `j`			| Go down a track					  	  						|
| `k`			| Go up a track					 	 	  						|
| `h`			| Previous instrument					 	 	  				|
| `l`			| Next instrument					 	 	  					|
| `d`			| Delete currently selected track					 	 	  	|
| `m`			| Toggle mic usage during recording. Off by default.			|
| `x`			| Export MIDI file of your tracks					 	 	  	|
