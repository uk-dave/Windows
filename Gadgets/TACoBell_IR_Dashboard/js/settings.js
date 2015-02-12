/*
 ************************************************************************
 *
 * TACoBell_IR_Dashboard
 * Copyright (C) 2014*2015, David C. Merritt, david.c.merritt@siemens.com
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
 * to display the GTAC EMEA TACoBell IR Dashboard in a minimal window.
 * 
 ************************************************************************
 * 
 * 03/01/2014  merritt  initial release
 * 05/01/2014  merritt  added copyright notice and delay launch option
 * 12/02/2015  merritt  updated copyright notice
 * 
 ************************************************************************
*/

System.Gadget.onSettingsClosing = settingsClosing;

// loadSettings() - loads the stored settings into the settings page form
function loadSettings()
{
	WidthDocked.innerText = System.Gadget.Settings.read("WidthDocked");
    HeightDocked.innerText = System.Gadget.Settings.read("HeightDocked");
    WidthUndocked.innerText = System.Gadget.Settings.read("WidthUndocked");
    HeightUndocked.innerText = System.Gadget.Settings.read("HeightUndocked");
    document.getElementById("ClipDocked").checked = System.Gadget.Settings.read("ClipDocked");
    DelayStart.innerText = System.Gadget.Settings.read("DelayStart");

}

// settingsClosing() - triggered by the System.Gadget.onSettingsClosing event
function settingsClosing(event)
{
	if (event.closeAction == event.Action.commit)
    {
		System.Gadget.Settings.write("WidthDocked", WidthDocked.value);      
		System.Gadget.Settings.write("HeightDocked", HeightDocked.value);
		System.Gadget.Settings.write("WidthUndocked", WidthUndocked.value);      
		System.Gadget.Settings.write("HeightUndocked", HeightUndocked.value);
        
        if (ClipDocked.checked)
        {
            System.Gadget.Settings.write("ClipDocked", true);
        }
        else
        {
            System.Gadget.Settings.write("ClipDocked", false);
        }
        
        System.Gadget.Settings.write("DelayStart", DelayStart.value);

	}
     
    // allow the Settings dialog to close
    event.cancel = false;
}



