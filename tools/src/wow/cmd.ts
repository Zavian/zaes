export interface Addon {
  name: string;
  title: string;
  notes: string;
  version: string;
  repo: string;
  branch: string;
  updated: string;
}

const BASE = 'https://tools.zaes.dev/addons';

// CRLF batch file: downloads each addon zip and unpacks it over the AddOns folder it sits in (or %1). Needs only curl + tar (built into Windows 10/11).
export function buildCmd(addons: Addon[]): string {
  const lines = [
    '@echo off',
    'setlocal',
    'rem Zavian WoW addons: downloads the latest version of each addon. Put this file in Interface\\AddOns (or pass the AddOns folder as argument).',
    'set "DEST=%~1"',
    'if "%DEST%"=="" set "DEST=%~dp0"',
    'cd /d "%DEST%" || (echo Folder not found & pause & exit /b 1)',
    'echo Updating addons in %CD%',
    'echo.',
  ];
  for (const a of addons) {
    lines.push(
      `echo == ${a.name}`,
      `curl -fsSL "${BASE}/${a.name}.zip" -o "%TEMP%\\${a.name}.zip" && tar -xf "%TEMP%\\${a.name}.zip" && del "%TEMP%\\${a.name}.zip" || echo FAILED: ${a.name}`,
    );
  }
  lines.push('echo.', 'echo Done. Restart WoW or /reload to load the new versions.', 'pause');
  return lines.join('\r\n') + '\r\n';
}
