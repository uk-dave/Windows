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


// amount of time desired to perform dock transition (in seconds)
var timeTransition = 2;

// --------------------------------------------------------------------
// check the gadget dock state and set the gadget style
// --------------------------------------------------------------------
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

// --------------------------------------------------------------------
// handle the Settings dialog closed event
// --------------------------------------------------------------------
function SettingsClosed(event)
{
    // user hits OK on the settings page
    if (event.closeAction == event.Action.commit)
    {
        CheckDockState();
    }
}
