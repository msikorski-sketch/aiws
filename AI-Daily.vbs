' ============================================================
'  AI Daily - jedyny launcher
'   (brak argumentu) -> uruchom ikone w zasobniku (tray)
'   "autostart"      -> tray w trybie autostartu (bez przegladarki)
'   "servers"        -> uruchom backend+frontend w tle (uzywa tray)
' ============================================================
Set sh  = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
projDir = fso.GetParentFolderName(WScript.ScriptFullName)
sh.CurrentDirectory = projDir

mode = ""
If WScript.Arguments.Count > 0 Then mode = LCase(WScript.Arguments(0))

If mode = "servers" Then
    ' Backend (4399) + klient Vite (4317) calkowicie w tle, bez okna
    sh.Run "cmd /c npm run dev", 0, False
Else
    ' Uruchom aplikacje w zasobniku; przekaz ewentualny tryb autostartu
    ps1 = projDir & "\tray\ai-daily-tray.ps1"
    extra = ""
    If mode = "autostart" Then extra = " autostart"
    sh.Run "powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & ps1 & """" & extra, 0, False
End If
