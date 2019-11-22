# Network Video Player
Network video player helps you play videos in your mobile phone from your computer
1. When both mobile and the computer are in the same wifi network.
2. When they are both connected to a high speed internet connection.

__Note__: The app hasn't been release to the app store yet. I'll update as soon as I add it to the app store.



## Installation instructions 
### Prequisites
1. **Nodejs and npm**
<br/>
You should have node.js and npm installed. Checkout Node.js [official installation page](https://nodejs.org/en/download/) if you do not have node.js installed on your computer.


### Step 1 - Install nvp npm module
```javascript
sudo su
npm i -g network-video-player // copy paste this, do not make misspell, as you are a super user.
exit
```


### Step 2 - Install nvp android app
Install nvb app on your android phone.


### Step 3 - Open port
If you'd like to view videos from your computer on your mobile and they are in the same network and youi don't want to use a tunnel then you have to open port 3333 on your computer. 


__Note:__ Opening a port is done automatically for __Fedora linux distro__.

### Step 4 - Run nvp
Open a terminal and go to the folder you'd like to see the files on.

```javascript
// for example
$ cd ~/Videos
// run nvp
$ sudo nvp
Enter http://192.168.43.177:3333, when app asks!
```

Enter the ip address from the terminal as is in the application. That is it! You should be able to browse the folders and view most of the videos in those folders. Currently 'mpeg4', 'h264' codecs are viewable.

If you'd like to contribute to the backend part of the application please send pull requests to this repository. 

If you see any issues please consider creating an issue in this repository.

