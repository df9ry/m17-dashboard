import { readFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import os from 'node:os';

const execFileAsync = promisify(execFile);

export interface SystemInfo {
  cpuPercent: number;
  cpuLoad1: number;
  cpuCores: number;
  cpuTemp: number | null;
  uptimeSeconds: number;
}

async function readCpuTemp(): Promise<number | null> {
  // Primär: Linux-Sysfs (Pi, viele SBCs, x86-Notebooks)
  try {
    const raw = await readFile('/sys/class/thermal/thermal_zone0/temp', 'utf8');
    const milli = parseInt(raw.trim(), 10);
    if (!Number.isNaN(milli)) return milli / 1000;
  } catch {
    // ignoriert – wir probieren den Fallback
  }

  // Fallback: Raspberry Pi ohne thermal_zone0
  try {
    const { stdout } = await execFileAsync('vcgencmd', ['measure_temp']);
    const m = stdout.match(/temp=([\d.]+)/);
    if (m) return parseFloat(m[1]);
  } catch {
    // kein vcgencmd vorhanden
  }

  return null;
}

export async function getSystemInfo(): Promise<SystemInfo> {
  const cores = os.cpus().length;
  const load1 = os.loadavg()[0]; // 1-Minuten-Load
  const cpuPercent = cores > 0 ? (load1 / cores) * 100 : 0;
  const cpuTemp = await readCpuTemp();

  return {
    cpuPercent: Math.round(cpuPercent * 10) / 10,
    cpuLoad1: Math.round(load1 * 100) / 100,
    cpuCores: cores,
    cpuTemp: cpuTemp !== null ? Math.round(cpuTemp * 10) / 10 : null,
    uptimeSeconds: Math.round(os.uptime()),
  };
}