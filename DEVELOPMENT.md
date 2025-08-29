# Development Notes

## Double API Calls in Development

This project uses React Strict Mode (`reactStrictMode: true` in `next.config.mjs`) which causes components to mount twice in development to help detect side effects. This can result in double API calls.

### Solutions Implemented:

1. **API Cache System** (`src/lib/api-cache.ts`):
   - Prevents duplicate API calls within a configurable time window
   - Used in auth provider for role and profile fetching
   - Automatically handles concurrent requests

2. **Auth Provider Improvements**:
   - Better initialization flow with proper loading states
   - Cached role and profile fetching
   - Prevents redundant auth state changes

### If You Want to Disable Double Mounting:

In `next.config.mjs`, change:
```javascript
reactStrictMode: true,
```
to:
```javascript
reactStrictMode: false,
```

**Note**: This is only recommended for debugging. Keep it enabled in development for better code quality.

### Understanding the Console Logs:

With proper logging in place, you'll see:
- 🔐 Auth initialization messages
- 📋 Cache hit/miss information  
- ✅ Successful operations
- ❌ Error states
- 🔄 Token refresh events

## Auth Flow Debug Guide

### Expected Auth Flow:

1. **Initial Load**: `🔐 Initializing auth...`
2. **Session Check**: `📋 Session check: { hasSession: true/false }`
3. **Profile Fetch**: `📝 Setting up user profile for: [user-id]`
4. **Role Check**: `🔍 Getting user role...`
5. **Complete**: `🎉 Auth initialization complete`

### Common Issues:

- **Stuck Loading**: Check if session exists but profile/role fetch fails
- **Double Calls**: Normal in development due to React Strict Mode
- **Role Issues**: Check database `user_roles` and `roles` tables

## Performance Notes

- **Profile Data**: Cached for 30 seconds
- **Role Data**: Cached for 5 minutes
- **API Cache**: Automatic cleanup of expired entries
- **Cross-Tab Sync**: Real-time auth state synchronization