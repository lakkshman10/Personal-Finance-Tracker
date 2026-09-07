const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Prisma } = require('@prisma/client');
const prisma = require('../config/prisma');
const AppError = require('../utils/AppError');

const REFRESH_DAYS = 7;
const REFRESH_MAX_AGE = REFRESH_DAYS * 24 * 60 * 60 * 1000;
const refreshCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: REFRESH_MAX_AGE,
});
const refreshCookieClearOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
});
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
const generateTokens = (userId, email, sessionId) => ({
  accessToken: jwt.sign({ userId, email, sessionId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' }),
  refreshToken: jwt.sign({ userId, email, sessionId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: `${REFRESH_DAYS}d` }),
});
const publicUser = (user) => ({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, currency: user.currency, timezone: user.timezone });
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const revokeAllSessions = async (userId) => prisma.refreshSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });

const createRefreshSession = async (user) => {
  const sessionId = crypto.randomUUID();
  const tokens = generateTokens(user.id, user.email, sessionId);
  await prisma.refreshSession.create({ data: { id: sessionId, userId: user.id, tokenHash: hashToken(tokens.refreshToken), expiresAt: new Date(Date.now() + REFRESH_MAX_AGE) } });
  return { ...tokens, sessionId };
};

const signup = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password } = req.body || {};
    if (typeof firstName !== 'string' || typeof lastName !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
      throw new AppError('First name, last name, email, and password are required.');
    }
    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !password) throw new AppError('All fields are required.');
    if (normalizedFirstName.length > 100 || normalizedLastName.length > 100) throw new AppError('First and last names must be at most 100 characters.');
    if (normalizedEmail.length > 254 || !emailRegex.test(normalizedEmail)) throw new AppError('Please enter a valid email address.');
    if (password.length > 128 || !passwordRegex.test(password)) throw new AppError('Password must be 8 to 128 characters long and contain a number and a special character.');
    if (await prisma.user.findUnique({ where: { email: normalizedEmail } })) throw new AppError('User already exists.', 409);
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({ data: { firstName: normalizedFirstName, lastName: normalizedLastName, email: normalizedEmail, passwordHash } });
    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return next(new AppError('User already exists.', 409));
    return next(error);
  }
};

const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!normalizedEmail || typeof password !== 'string' || !password) throw new AppError('Email and password are required.');
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) throw new AppError('Invalid credentials.', 401);
    const tokens = await createRefreshSession(user);
    res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions());
    return res.status(200).json({ message: 'Signin successful.', accessToken: tokens.accessToken, user: publicUser(user) });
  } catch (error) { return next(error); }
};

const logout = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) await prisma.refreshSession.updateMany({ where: { tokenHash: hashToken(token), revokedAt: null }, data: { revokedAt: new Date() } });
    res.clearCookie('refreshToken', refreshCookieClearOptions());
    res.clearCookie('token');
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) { return next(error); }
};

const check = async (req, res, next) => {
  try { const user = await prisma.user.findUnique({ where: { id: req.user.id } }); if (!user) throw new AppError('User not found.', 404); return res.status(200).json({ message: 'User is authenticated.', user: publicUser(user) }); } catch (error) { return next(error); }
};

const refreshToken = async (req, res, next) => {
  const token = req.cookies?.refreshToken;
  if (!token) return next(new AppError('No refresh token provided.', 401));
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded.userId || !decoded.sessionId) throw new AppError('Refresh token is invalid or expired.', 401);
    const session = await prisma.refreshSession.findFirst({ where: { id: decoded.sessionId, userId: decoded.userId, tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() } }, include: { user: true } });
    if (!session) throw new AppError('Refresh token is invalid or expired.', 401);
    const replacementSessionId = crypto.randomUUID();
    const replacementTokens = generateTokens(session.user.id, session.user.email, replacementSessionId);
    await prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshSession.updateMany({ where: { id: session.id, tokenHash: hashToken(token), revokedAt: null, expiresAt: { gt: new Date() } }, data: { revokedAt: new Date() } });
      if (revoked.count !== 1) throw new AppError('Refresh token is invalid or expired.', 401);
      await tx.refreshSession.create({ data: { id: replacementSessionId, userId: session.user.id, tokenHash: hashToken(replacementTokens.refreshToken), expiresAt: new Date(Date.now() + REFRESH_MAX_AGE) } });
    });
    res.cookie('refreshToken', replacementTokens.refreshToken, refreshCookieOptions());
    return res.status(200).json({ message: 'Token refreshed successfully.', accessToken: replacementTokens.accessToken });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') return next(new AppError('Refresh token is invalid or expired.', 401));
    return next(error);
  }
};

const getAccount = async (req, res, next) => {
  try { const user = await prisma.user.findUnique({ where: { id: req.user.id } }); if (!user) throw new AppError('User not found.', 404); return res.status(200).json({ user: publicUser(user), createdAt: user.createdAt, updatedAt: user.updatedAt }); } catch (error) { return next(error); }
};

const updateAccount = async (req, res, next) => {
  try {
    const { firstName, lastName, email, currency, timezone } = req.body || {}; const data = {};
    if (firstName !== undefined) { const value = String(firstName).trim(); if (!value || value.length > 100) throw new AppError('First name must be between 1 and 100 characters.'); data.firstName = value; }
    if (lastName !== undefined) { const value = String(lastName).trim(); if (!value || value.length > 100) throw new AppError('Last name must be between 1 and 100 characters.'); data.lastName = value; }
    if (email !== undefined) { const value = typeof email === 'string' ? email.trim().toLowerCase() : ''; if (!value || !emailRegex.test(value)) throw new AppError('Please enter a valid email address.'); data.email = value; }
    if (currency !== undefined) { const value = typeof currency === 'string' ? currency.trim().toUpperCase() : ''; if (!/^[A-Z]{3}$/.test(value)) throw new AppError('Currency must be a valid 3-letter code.'); data.currency = value; }
    if (timezone !== undefined) { const value = typeof timezone === 'string' ? timezone.trim() : ''; if (!value || value.length > 64) throw new AppError('Timezone is required and must be at most 64 characters.'); data.timezone = value; }
    if (!Object.keys(data).length) throw new AppError('No account changes were provided.');
    const user = await prisma.user.update({ where: { id: req.user.id }, data });
    if (data.email) await revokeAllSessions(req.user.id);
    return res.status(200).json({ message: 'Account updated successfully.', user: publicUser(user) });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return next(new AppError('That email address is already in use.', 409));
    return next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body || {};
    if (!currentPassword || !newPassword) throw new AppError('Current password and new password are required.');
    if (!passwordRegex.test(newPassword) || newPassword.length > 128) throw new AppError('New password must be 8 to 128 characters long and contain a number and a special character.');
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) throw new AppError('Current password is incorrect.', 401);
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.$transaction(async (tx) => { await tx.user.update({ where: { id: req.user.id }, data: { passwordHash } }); await tx.refreshSession.updateMany({ where: { userId: req.user.id, revokedAt: null }, data: { revokedAt: new Date() } }); });
    res.clearCookie('refreshToken', refreshCookieClearOptions());
    return res.status(200).json({ message: 'Password changed successfully.' });
  } catch (error) { return next(error); }
};

const getPreferences = async (req, res) => res.status(410).json({ error: 'User preferences endpoint has been replaced by PostgreSQL-backed budget settings.' });
const updatePreferences = async (req, res) => res.status(410).json({ error: 'User preferences endpoint has been replaced by PostgreSQL-backed budget settings.' });

module.exports = { signup, signin, logout, check, refreshToken, getAccount, updateAccount, changePassword, getPreferences, updatePreferences };
