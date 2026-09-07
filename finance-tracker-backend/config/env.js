const REQUIRED_VARS = ['DATABASE_URL', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];

const isPlaceholder = (value) => !value || /^(your_|change_me|replace_me|example|secret_here)/i.test(value.trim());

const validateEnvironment = () => {
  const missing = REQUIRED_VARS.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production') {
    const weakSecrets = ['ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'].filter((name) => {
      const value = process.env[name];
      return value.length < 32 || isPlaceholder(value);
    });

    if (weakSecrets.length) {
      throw new Error(`${weakSecrets.join(' and ')} must be at least 32 characters and must not use placeholder values in production.`);
    }

    if (!process.env.CLIENT_ORIGIN) {
      throw new Error('CLIENT_ORIGIN is required in production.');
    }

    let origin;
    try {
      origin = new URL(process.env.CLIENT_ORIGIN);
    } catch {
      throw new Error('CLIENT_ORIGIN must be a valid absolute URL in production.');
    }

    if (!['http:', 'https:'].includes(origin.protocol)) {
      throw new Error('CLIENT_ORIGIN must use http or https in production.');
    }
  }
};

module.exports = validateEnvironment;
