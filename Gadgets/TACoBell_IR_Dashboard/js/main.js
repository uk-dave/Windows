/*
 ************************************************************************
 *
 * TACoBell_IR_Dashboard
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
 * The javascript for the main.html file for a Windows Sidebar gadget to 
 * display the GTAC EMEA TACoBell IR Dashboard in a minimal window.
 * 
 ************************************************************************
 * 
 * 03/01/2014  merritt  initial release
 * 05/01/2014  merritt  added copyright notice and delay launch option
 * 06/03/2014  merritt  changed page load delay to 15 for VPN connection
 * 
 ************************************************************************
*/

// enable the gadget settings functionality
System.Gadget.settingsUI = "settings.html";
System.Gadget.onSettingsClosed = SettingsClosed;

// declare the dock and undock event handlers
System.Gadget.onDock = CheckDockState;
System.Gadget.onUndock = CheckDockState;

// set the default sizes for docked and undocked
if (System.Gadget.Settings.read("WidthDocked") == "")
{
    System.Gadget.Settings.write("WidthDocked", 450);
}

if (System.Gadget.Settings.read("HeightDocked") == "")
{
    System.Gadget.Settings.write("HeightDocked", 105);
}

if (System.Gadget.Settings.read("WidthUndocked") == "")
{
    System.Gadget.Settings.write("WidthUndocked", 1350);
}

if (System.Gadget.Settings.read("HeightUndocked") == "")
{
    System.Gadget.Settings.write("HeightUndocked", 420);
}

if (System.Gadget.Settings.read("ClipDocked") == "")
{
    System.Gadget.Settings.write("ClipDocked", true);
}

if (System.Gadget.Settings.read("DelayStart") == "")
{
    System.Gadget.Settings.write("DelayStart", 0.10);
}

// set the TACoBell url
var urlTacobell = "http://gbcbygtac01:8080/cgi-bin/tb_main_page.pl";
var delayCount = System.Gadget.Settings.read("DelayStart") * 60;

// amount of time desired to perform dock transition (in seconds)
var timeTransition = 2;

// check the gadget dock state and set the gadget style
function CheckDockState()
{
    System.Gadget.beginTransition();

    var oBody = document.body.style;
    
    if (System.Gadget.docked)
    {
	    oBody.width = System.Gadget.Settings.read("WidthDocked");
	    oBody.height = System.Gadget.Settings.read("HeightDocked");
        
        if (System.Gadget.Settings.read("ClipDocked"))
        {
            document.getElementById("tacoFrame").width = System.Gadget.Settings.read("WidthDocked") + 1000;
            document.getElementById("tacoFrame").height = System.Gadget.Settings.read("HeightDocked") + 1000; 
            document.getElementById("tacoFrame").scrolling = "yes";            
        }
        else
        {
            document.getElementById("tacoFrame").width = System.Gadget.Settings.read("WidthDocked");
            document.getElementById("tacoFrame").height = System.Gadget.Settings.read("HeightDocked");
        }  
    }
    else
    {
        oBody.width = System.Gadget.Settings.read("WidthUndocked");
        oBody.height = System.Gadget.Settings.read("HeightUndocked");  
        document.getElementById("tacoFrame").width = System.Gadget.Settings.read("WidthUndocked");
        document.getElementById("tacoFrame").height = System.Gadget.Settings.read("HeightUndocked");
    }
    
    System.Gadget.endTransition(System.Gadget.TransitionType.morph, timeTransition);
}

// handle the Settings dialog closed event
function SettingsClosed(event)
{
    // user hits OK on the settings page
    if (event.closeAction == event.Action.commit)
    {
        CheckDockState();
    }
}

// check if the launch should be delayed
function CheckLaunch()
{
    if (delayCount <= 0)
    {
        document.getElementById("displayDelay").firstChild.nodeValue = "Done";        
        document.getElementById("tacoFrame").src = urlTacobell;
    }
    else
    {
        intervalId = setInterval(function(){CountDown()}, 1000);            
    }
}


// calculate hours, mins and secs and display time
function DisplayTime(now)
{
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
    document.body.style.backgroundColor = System.Gadget.Settings.read("Background");
    document.body.style.color = System.Gadget.Settings.read("Colour");
    document.getElementById("displayDelay").firstChild.nodeValue = "Launching TACoBell in " + hour + ":" + min + ":" + sec;          
 }

 // the main countdown
function CountDown()
{
    delayCount = delayCount - 1;
    if (delayCount <= 0)
    {
        document.getElementById("displayDelay").firstChild.nodeValue = "Launching TACoBell...";        
        document.getElementById("tacoFrame").src = urlTacobell;
        document.getElementById("displayDelay").firstChild.nodeValue = "Loaded";        
        clearInterval(intervalId);
        return;
    }

    DisplayTime(delayCount);
}    
