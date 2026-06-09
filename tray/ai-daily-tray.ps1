# ============================================================
#  AI Daily - aplikacja w zasobniku systemowym (system tray)
#  Jedyny punkt sterowania: Otworz / Start / Stop / Autostart / Zakoncz
#  Pojedyncza instancja: kolejne uruchomienie tylko otwiera przegladarke.
#  Argument "autostart" => nie otwieraj przegladarki przy starcie.
# ============================================================
$IsAutostart = ($args -contains 'autostart')

$ProjDir     = Split-Path -Parent $PSScriptRoot
$IcoPath     = Join-Path $ProjDir 'ai-daily.ico'
$LauncherVbs = Join-Path $ProjDir 'AI-Daily.vbs'
$ClientUrl   = 'http://localhost:4317'
$StartupLnk  = Join-Path ([Environment]::GetFolderPath('Startup')) 'AI Daily.lnk'

# ---------- pojedyncza instancja ----------
$createdNew = $false
$mutex = New-Object System.Threading.Mutex($true, 'Local\AIDailyTraySingleton', [ref]$createdNew)
if (-not $createdNew) {
  # Tray juz dziala -> tylko otworz przegladarke (jesli nie autostart) i wyjdz
  if (-not $IsAutostart) { Start-Process $ClientUrl }
  return
}

[void][System.Reflection.Assembly]::LoadWithPartialName('System.Windows.Forms')
[void][System.Reflection.Assembly]::LoadWithPartialName('System.Drawing')

# ---------- funkcje ----------
function Test-Running {
  $null -ne (Get-NetTCPConnection -LocalPort 4317 -State Listen -ErrorAction SilentlyContinue)
}

function Start-Servers {
  if (Test-Running) { return }
  Start-Process -FilePath "$env:SystemRoot\System32\wscript.exe" `
    -ArgumentList "`"$LauncherVbs`" servers" -WindowStyle Hidden
}

function Stop-Servers {
  foreach ($port in 4399, 4317) {
    Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
      ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop } catch {} }
  }
}

function Open-App {
  Start-Servers
  for ($i = 0; $i -lt 40; $i++) { if (Test-Running) { break }; Start-Sleep -Milliseconds 500 }
  Start-Process $ClientUrl
}

function Test-Autostart { Test-Path $StartupLnk }

function Set-Autostart([bool]$enable) {
  if ($enable) {
    $ws = New-Object -ComObject WScript.Shell
    $s = $ws.CreateShortcut($StartupLnk)
    $s.TargetPath       = "$env:SystemRoot\System32\wscript.exe"
    $s.Arguments        = "`"$LauncherVbs`" autostart"
    $s.WorkingDirectory = $ProjDir
    $s.IconLocation     = "$IcoPath,0"
    $s.WindowStyle      = 1
    $s.Description       = 'AI Daily - autostart'
    $s.Save()
  } else {
    Remove-Item $StartupLnk -Force -ErrorAction SilentlyContinue
  }
}

# ---------- ikona w zasobniku ----------
$notify = New-Object System.Windows.Forms.NotifyIcon
$notify.Icon = New-Object System.Drawing.Icon($IcoPath)
$notify.Text = 'AI Daily'
$notify.Visible = $true

$menu = New-Object System.Windows.Forms.ContextMenuStrip

$miOpen = $menu.Items.Add('Otworz AI Daily')
$miOpen.add_Click({ Open-App })

$menu.Items.Add('-') | Out-Null

$miStart = $menu.Items.Add('Uruchom serwery')
$miStart.add_Click({ Start-Servers; $notify.ShowBalloonTip(2000, 'AI Daily', 'Serwery uruchamiane...', 'Info') })

$miStop = $menu.Items.Add('Zatrzymaj serwery')
$miStop.add_Click({ Stop-Servers; $notify.ShowBalloonTip(2000, 'AI Daily', 'Serwery zatrzymane.', 'Info') })

$menu.Items.Add('-') | Out-Null

$miAuto = New-Object System.Windows.Forms.ToolStripMenuItem('Uruchamiaj z Windowsem')
$miAuto.add_Click({ $new = -not (Test-Autostart); Set-Autostart $new; $miAuto.Checked = $new })
$menu.Items.Add($miAuto) | Out-Null

$menu.Items.Add('-') | Out-Null

$miExit = $menu.Items.Add('Zakoncz (zatrzymaj i zamknij)')
$miExit.add_Click({
  Stop-Servers
  $notify.Visible = $false
  $notify.Dispose()
  [System.Windows.Forms.Application]::Exit()
})

$menu.add_Opening({
  $running = Test-Running
  $miStart.Enabled = -not $running
  $miStop.Enabled  = $running
  $miAuto.Checked  = Test-Autostart
})

$notify.ContextMenuStrip = $menu
$notify.add_MouseDoubleClick({ Open-App })

# Pokaz krotka informacje i wykonaj akcje startowa
if ($IsAutostart) {
  Start-Servers
} else {
  $notify.ShowBalloonTip(2500, 'AI Daily', 'Uruchamiam i otwieram w przegladarce...', 'Info')
  Open-App
}

# pompa komunikatow - utrzymuje ikone przy zyciu
$ctx = New-Object System.Windows.Forms.ApplicationContext
[System.Windows.Forms.Application]::Run($ctx)

# po wyjsciu zwolnij mutex
$mutex.ReleaseMutex()
$mutex.Dispose()
