/**
 * ============================================
 * ENVIRONMENT VARIABLES LOADER
 * Loads .env variables for client-side use
 * ============================================
 */

// Parse .env file and set to process.env
async function loadEnvVariables() {
    try {
        const response = await fetch('/.env');
        const envText = await response.text();
        
        // Parse .env file
        const lines = envText.split('\n');
        const env = {};
        
        lines.forEach(line => {
            line = line.trim();
            if (line && !line.startsWith('#')) {
                const [key, ...valueParts] = line.split('=');
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                env[key.trim()] = value;
            }
        });
        
        // Set to process.env
        if (!window.process) {
            window.process = { env: {} };
        }
        window.process.env = { ...window.process.env, ...env };
        
        console.log('✅ Environment variables loaded');
        return true;
        
    } catch (error) {
        console.error('❌ Error loading .env file:', error);
        console.error('Make sure .env file exists in root directory');
        return false;
    }
}

// Load before any other scripts
loadEnvVariables();
