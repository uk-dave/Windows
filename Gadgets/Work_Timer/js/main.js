/*
 ************************************************************************
 *
 * Work_Timer
 * Copyright (C) 2014, David C. Merritt, david.c.merritt@siemens.com
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 * 
 ************************************************************************
 * 
 * The javascript for the main.html file for a Windows Sidebar gadget for 
 * a simple countdown timer for Windows.
 * 
 ************************************************************************
 * 
 * 05/01/2014  merritt  initial release
 * 06/02/2014  merritt  added paused alert
 * 
 ************************************************************************
*/

// enable the gadget options functionality
System.Gadget.settingsUI = "settings.html";
System.Gadget.onSettingsClosed = SettingsClosed;

// Specify the flyout root
System.Gadget.Flyout.file = "flyout.html";
var oFlyoutDocument;

// read the user options, if none set create defaults
if (System.Gadget.Settings.read("Minutes") == "")
{
    System.Gadget.Settings.write("Minutes", 25);
}

if (System.Gadget.Settings.read("Colour") == "")
{
    System.Gadget.Settings.write("Colour", "ffffff");
}

if (System.Gadget.Settings.read("Background") == "")
{
    System.Gadget.Settings.write("Background", "000000");
}

if (System.Gadget.Settings.read("Paused") == "")
{
    System.Gadget.Settings.write("Paused", "ff0000");
}

if (System.Gadget.Settings.read("PausedFlash") == "")
{
    System.Gadget.Settings.write("PausedFlash", true);
}

if (System.Gadget.Settings.read("Message") == "")
{
    System.Gadget.Settings.write("Message", "Take a break!");
}

if (System.Gadget.Settings.read("AlarmSound") == "")
{
    System.Gadget.Settings.write("AlarmSound", "alarm_clock_bell");
}

if (System.Gadget.Settings.read("Autostart") == "")
{
    System.Gadget.Settings.write("Autostart", true);
}

if (System.Gadget.Settings.read("NegativeCount") == "")
{
    System.Gadget.Settings.write("NegativeCount", true);
}

// set vars based on user options etc
var startTime = System.Gadget.Settings.read("Minutes") * 60;
var running = System.Gadget.Settings.read("Autostart");
var negCount = System.Gadget.Settings.read("NegativeCount");
var alertMe = true;
var intervalId;
var blinkId;
var pauseId;

 // on initial load display the default time and check if to auto start
function CheckStart()
{
    DisplayTime(startTime);
    if (running)
    {
        if (startTime > 0)
        {
            intervalId = setInterval(function(){CountDown()}, 1000); 
        }
    }
}

// start and stop the counter when mouse pressed
function StartStop()
{
    if (running)
    {
        running = false;
        clearInterval(intervalId);   
        System.Gadget.Flyout.show = false;     

        // change the background when paused
        if (System.Gadget.Settings.read("PausedFlash"))
        {
            pauseId = setInterval(function(){BlinkPaused()},500);
        }
        else
        {
            document.body.style.backgroundColor = System.Gadget.Settings.read("Paused");
        }
       
        if (! negCount)
        {
            document.getElementById("timer").style.visibility = "visible";
        }
        
    }
    else
    {
        running = true;   
        clearInterval(pauseId);       
        document.body.style.backgroundColor = System.Gadget.Settings.read("Background");        
        
        if (! negCount)
        {
            if (startTime > 0)
            {
                intervalId = setInterval(function(){CountDown()}, 1000); 
            }
        }
        else
        {
            intervalId = setInterval(function(){CountDown()}, 1000); 
        }
    }
}

// stop counter and reset the default time
function Reset()
{
    clearInterval(intervalId);
    clearInterval(blinkId);
    clearInterval(pauseId);
    document.getElementById("timer").style.visibility = "visible";
    System.Gadget.Flyout.show = false;
    running = false;
    alertMe = true;
    startTime = System.Gadget.Settings.read("Minutes") * 60;
    DisplayTime(startTime);
}

// the main countdown
function CountDown()
{
    startTime = startTime - 1;
    if (startTime <= 0)
    {
        // if not doing negative count stop timer
        if (! negCount)
        {
            clearInterval(intervalId);
        }
        
        // alert one time
        if (alertMe)
        {
            System.Sound.playSound("audio/" + System.Gadget.Settings.read("AlarmSound") + ".wav");             
            blinkId = setInterval(function(){BlinkText()},500);
            showFlyout();
            alertMe = false;
        }   
        
        // if not doing negative count return 
        if (! negCount)
        {
            return;
        }
    }

    DisplayTime(startTime);
}    

// flash background indefinitely when countdown paused
function BlinkPaused()
{
    if (System.Gadget.Settings.read("Background") == "000000")
    {
        currentBackground = "#000000"; 
    }
    else
    {
        currentBackground = "#" + System.Gadget.Settings.read("Background");
    }
    
    if (document.body.style.backgroundColor == currentBackground)
    {
        document.body.style.backgroundColor = System.Gadget.Settings.read("Paused");    
    }
    else
    {
        document.body.style.backgroundColor = System.Gadget.Settings.read("Background");         
    }
    return;
}

// blink the text indefinitely when countdown complete
function BlinkText()
{
    if (document.getElementById("timer").style.visibility == "hidden")
    {
        document.getElementById("timer").style.visibility = "visible";
    }
    else
    {
        document.getElementById("timer").style.visibility = "hidden";
    }
    return;
}

// calculate hours, mins and secs and display time
function DisplayTime(now)
{
    // if in negative countdown set absolute and flag
    showNeg = false;
    if (now < 0)
    {
        now = Math.abs(now);
        showNeg = true;
    }

    var hour = Math.floor((now / 3600) % 24);
    var min = Math.floor((now / 60) % 60);
    var sec = Math.floor((now / 1) % 60);
    if (min < 10) 
    { 
        min = "0" + min; 
    }
    if (sec < 10) 
    { 
        sec = "0" + sec; 
    }
    if (hour < 10) 
    { 
        hour = "0" + hour; 
    }
    
    // set the colour and text
    document.body.style.color = System.Gadget.Settings.read("Colour");
    
    // set background colour based on running state
    if (running)
    {
        document.body.style.backgroundColor = System.Gadget.Settings.read("Background");
    }
    else
    {
        // change the background when paused
        if (System.Gadget.Settings.read("PausedFlash"))
        {
            pauseId = setInterval(function(){BlinkPaused()},500);
        }
        else
        {
            document.body.style.backgroundColor = System.Gadget.Settings.read("Paused");
        }      
    }
      
    if (showNeg)
    {
        document.getElementById("timer").firstChild.nodeValue = "-" + hour + ":" + min + ":" + sec;
    }
    else
    {
        document.getElementById("timer").firstChild.nodeValue = hour + ":" + min + ":" + sec;   
    }       
 }

// display the flyout for the countdown message
function showFlyout()
{
    System.Gadget.Flyout.show = true;
    oFlyoutDocument = System.Gadget.Flyout.document;
}

// handle the options dialog closed event
function SettingsClosed(event)
{
    // user hits OK on the settings page
    if (event.closeAction == event.Action.commit)
    {    
        // set background colour based on running state
        if (running)
        {
            document.body.style.backgroundColor = System.Gadget.Settings.read("Background");
        }
        else
        {
            clearInterval(pauseId);
            // change the background when paused          
            if (System.Gadget.Settings.read("PausedFlash"))
            {
                pauseId = setInterval(function(){BlinkPaused()},500);
            }
            else
            {                  
                document.body.style.backgroundColor = System.Gadget.Settings.read("Paused");
            }       
        }
        
        negCount = System.Gadget.Settings.read("NegativeCount");         
    }
}
