/* eslint-disable no-console */
const { execSync } = require('child_process');

const PORT = process.env.PORT || '5000';

const killPid = (pid) => {
  if (!pid) return;
  try {
    if (process.platform === 'win32') {
      execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    } else {
      execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
    }
    console.log(`[predev] Freed port ${PORT} by stopping PID ${pid}`);
  } catch {
    // Ignore kill errors so local dev is not blocked.
  }
};

const freePort = () => {
  try {
    if (process.platform === 'win32') {
      const output = execSync(`netstat -ano -p tcp | findstr :${PORT}`, {
        encoding: 'utf8',
      });

      const pids = output
        .split('\n')
        .map((line) => line.trim())
        .filter((line) => line.includes('LISTENING'))
        .map((line) => line.split(/\s+/).at(-1))
        .filter(Boolean);

      [...new Set(pids)].forEach(killPid);
      return;
    }

    const pid = execSync(`lsof -ti tcp:${PORT}`, { encoding: 'utf8' }).trim();
    if (pid) killPid(pid);
  } catch {
    console.log(`[predev] Port ${PORT} is already free`);
  }
};

freePort();
