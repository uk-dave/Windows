' CreateNetworkLocations
' Copyright (C) 2013, David C. Merritt, david.c.merritt@siemens.com
'
' This program is free software: you can redistribute it and/or modify
' it under the terms of the GNU General Public License as published by
' the Free Software Foundation, either version 3 of the License, or
' (at your option) any later version.
'
' This program is distributed in the hope that it will be useful,
' but WITHOUT ANY WARRANTY; without even the implied warranty of
' MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
' GNU General Public License for more details.
'
' You should have received a copy of the GNU General Public License
' along with this program.  If not, see <http://www.gnu.org/licenses/>.
'
' ---------------------------------------------------------------------
'
' A script to automate the creation of Network Location shortcuts on 
' on Windows 7 clients, including http, https and ftp addresses.
' 
' This script is particularly useful for IT administrators needing a
' way to automate the creation of required Network Location shortcuts 
' i.e. user logon scripts, etc.
'
' To use - edit, add and remove the array members ShortcutNames and
' ShortcutPaths.  Adjust the array counter accordingly to match the
' number of network locations to be created.
'
' This is a simple script and does minimal error checking. It should be 
' fleshed out to best suit your specific needs and environment.
'
' ---------------------------------------------------------------------
'
' 28/01/2013  merritt  initial release 
'


' ---------------------------------------------------------------------
' edit, add and remove your network locations below here
' ---------------------------------------------------------------------
dim ShortcutNames(3), ShortcutPaths(3)
ShortcutNames(0) = "hsvnt416z06 - PreReleased"
ShortcutPaths(0) = "http://hsvnt416z06/Pre/PreDL"
ShortcutNames(1) = "hsvnt416z01 - PreReleased"
ShortcutPaths(1) = "http://hsvnt416z01:16133/Pre"
ShortcutNames(2) = "SSL hsvnt416z01 - PreReleased"
ShortcutPaths(2) = "https://hsvnt416z01.net.plm.eds.com/Pre/PreDL"
ShortcutNames(3) = "GTAC FTP"
ShortcutPaths(3) = "ftp://ftp.ugs.com"

' ---------------------------------------------------------------------
' edit, add and remove your network locations above here
' ---------------------------------------------------------------------

' create network place shortcut for each location specified
intCounter = 0
For Each strShortcutName In ShortcutNames
    CreateNetworkPlace strShortcutName, ShortcutPaths(intCounter)
     intCounter = intCounter + 1
Next
wscript.echo "Network place shortcuts created"
WScript.Quit 

' the subroutine that does all the work
Sub CreateNetworkPlace(strShortcutName, strShortcutPath)
    ' where neccessary change our shortcut path to the Win 7 webdav format
    If InStr(UCase(strShortcutPath), UCase("https")) = 0 Then
        If InStr(UCase(strShortcutPath), UCase("ftp")) = 0 Then
            ' http addresses
            strShortcutMod = Replace(strShortcutPath, "http://", "\\")
            strShortcutMod = Replace(strShortcutMod, "/", "\DavWWWRoot\", 1, 1)        
            strShortcutMod = Replace(strShortcutMod, "/", "\")
            strShortcutMod = Replace(strShortcutMod, ":", "@")       
        Else
            ' ftp addresses
            strShortcutMod = strShortcutPath
        End If
    Else
        ' https addresses
        strShortcutMod = Replace(strShortcutPath, "https://", "\\")
        strShortcutMod = Replace(strShortcutMod, "/", "@SSL\DavWWWRoot\", 1, 1)
        strShortcutMod = Replace(strShortcutMod, "/", "\")
        strShortcutMod = Replace(strShortcutMod, ":", "@")
   End If 
    
    ' determine on the OS where to create the network place shortcut 
    Const NETHOOD = &H13&
    Set objWSHShell = CreateObject("Wscript.Shell")
    Set objShell = CreateObject("Shell.Application")
    Set objFolder = objShell.Namespace(NETHOOD)
    Set objFolderItem = objFolder.Self
    strNetHood = objFolderItem.Path

    ' create the network place shortcut folder 
    Set objFSO = CreateObject("Scripting.FileSystemObject")
    strShortcutFolder = strNetHood & "\" & strShortcutName
    If objFSO.FolderExists(strShortcutFolder) Then
        wscript.echo strShortcutFolder & " already exists"
    Else
        Set objFolder = objFSO.CreateFolder(strShortcutFolder)
        
        ' create the Desktop.ini file under the network place shortcut folder 
        strDesktopIni = strShortcutFolder & "\Desktop.ini"
        If Not objFSO.FileExists(strDesktopIni) Then
            set fText = objFSO.OpenTextFile(strDesktopIni, 2, True) 
            fText.WriteLine "[.ShellClassInfo]"
            fText.WriteLine "CLSID2={0AFACED1-E828-11D1-9187-B532F1E9575D}"
            fText.WriteLine "Flags=2"
            fText.Close
        End If

        ' set Desktop.ini with file attributes system & hidden
        Set fFile = objFSO.GetFile(strDesktopIni)
        fFile.Attributes = 6

        ' set network place shortcut folder as read-only
        Set fFolder = objFSO.GetFolder(strShortcutFolder)
        fFolder.Attributes = 1

        ' create the shortcut file target.lnk under the network place shortcut folder
        Set objShortcut = objWSHShell.CreateShortcut(strShortcutFolder & "\target.lnk")
        objShortcut.TargetPath = strShortcutMod
        objShortcut.Description = strShortcutPath
        objShortcut.Save
    End If
End Sub
