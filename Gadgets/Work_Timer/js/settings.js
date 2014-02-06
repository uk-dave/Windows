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
 * The javascript for the settings.html file for a Windows Sidebar gadget 
 * for a simple countdown timer for Windows.
 * 
 ************************************************************************
 * 
 * 05/01/2014  merritt  initial release
 * 06/02/2014  merritt  added paused alert
 * 
 ************************************************************************
*/

System.Gadget.onSettingsClosing = settingsClosing;

// loadSettings() - loads the stored settings into the settings page form
function loadSettings()
{
	Minutes.innerText = System.Gadget.Settings.read("Minutes");
    
    // account for 000000 getting rounded to 0
    if (System.Gadget.Settings.read("Colour") == "000000")
    {
        ColourFont.innerText = "000000"; 
    }
    else
    {
        ColourFont.innerText = "" + System.Gadget.Settings.read("Colour");
    }
     
    if (System.Gadget.Settings.read("Background") == "000000")
    {
        ColourBackground.innerText = "000000"; 
    }
    else
    {
        ColourBackground.innerText = System.Gadget.Settings.read("Background");
    }
    
    if (System.Gadget.Settings.read("Paused") == "000000")
    {
        ColourPaused.innerText = "000000"; 
    }
    else
    {
        ColourPaused.innerText = System.Gadget.Settings.read("Paused");
    }
    
    document.getElementById("PausedFlash").checked = System.Gadget.Settings.read("PausedFlash");
    MsgText.innerText = System.Gadget.Settings.read("Message");
    Alarm.value = System.Gadget.Settings.read("AlarmSound");
    document.getElementById("Autostart").checked = System.Gadget.Settings.read("Autostart");
    document.getElementById("Negative").checked = System.Gadget.Settings.read("NegativeCount");
}

// settingsClosing() - triggered by the System.Gadget.onSettingsClosing event
function settingsClosing(event)
{
	if (event.closeAction == event.Action.commit)
    {
		System.Gadget.Settings.write("Minutes", Minutes.value);      
		System.Gadget.Settings.write("Colour", ColourFont.value);
		System.Gadget.Settings.write("Background", ColourBackground.value);      
		System.Gadget.Settings.write("Paused", ColourPaused.value); 
  
        if (PausedFlash.checked)
        {
            System.Gadget.Settings.write("PausedFlash", true);
        }
        else
        {
            System.Gadget.Settings.write("PausedFlash", false);
        }
     
		System.Gadget.Settings.write("Message", MsgText.value);
		System.Gadget.Settings.write("AlarmSound", Alarm.value);
        
        if (Autostart.checked)
        {
            System.Gadget.Settings.write("Autostart", true);
        }
        else
        {
            System.Gadget.Settings.write("Autostart", false);
        }
        
        if (Negative.checked)
        {
            System.Gadget.Settings.write("NegativeCount", true);
        }
        else
        {
            System.Gadget.Settings.write("NegativeCount", false);
        }
	}
     
    // allow the Settings dialog to close
    event.cancel = false;
}



