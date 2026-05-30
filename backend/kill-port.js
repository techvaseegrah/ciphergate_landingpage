const { execSync } = require('child_process');

try {
    const result = execSync('netstat -ano | findstr :5001', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    const pids = new Set();

    result.split('\n').forEach(line => {
        if (line.includes('LISTENING')) {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0') pids.add(pid);
        }
    });

    if (pids.size === 0) {
        console.log('✅ Port 5001 is free.');
    } else {
        pids.forEach(pid => {
            try {
                execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                console.log(`🔪 Killed PID ${pid} on port 5001`);
            } catch (_) {}
        });
    }
} catch (_) {
    console.log('✅ Port 5001 is free.');
}
