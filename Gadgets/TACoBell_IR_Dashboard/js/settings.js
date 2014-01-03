System.Gadget.onSettingsClosing = settingsClosing;

// loadSettings() - loads the stored settings into the settings page form
function loadSettings()
{
	WidthDocked.innerText = System.Gadget.Settings.read("WidthDocked");
    HeightDocked.innerText = System.Gadget.Settings.read("HeightDocked");
    WidthUndocked.innerText = System.Gadget.Settings.read("WidthUndocked");
    HeightUndocked.innerText = System.Gadget.Settings.read("HeightUndocked");
    document.getElementById("ClipDocked").checked = System.Gadget.Settings.read("ClipDocked");
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
	}
     
    // allow the Settings dialog to close
    event.cancel = false;
}



