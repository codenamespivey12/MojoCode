# Database Setup Guide

This guide explains how to set up and use the Neon PostgreSQL database integration with Clerk authentication for storing user conversation history.

## Prerequisites

1. **Neon Database Account**: Sign up at [neon.tech](https://neon.tech)
2. **Clerk Account**: Already configured in this project
3. **Environment Variables**: Properly configured `.env` file

## Environment Configuration

Create a `.env` file in the frontend directory with the following variables:

```env
# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Neon Database
VITE_DATABASE_URL=postgresql://username:password@host/database?sslmode=require
DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Existing backend configuration
VITE_BACKEND_HOST=http://localhost:3000
VITE_USE_TLS=false
VITE_FRONTEND_PORT=3001
VITE_TLS_VERIFY=false
```

### Getting Your Neon Database URL

1. Go to your [Neon Console](https://console.neon.tech)
2. Select your project
3. Go to the "Connection Details" section
4. Copy the connection string (it should look like the format above)

## Database Schema

The database includes two main tables:

### Conversations Table
- `id`: UUID primary key
- `user_id`: Text (linked to Clerk user ID)
- `title`: Text (conversation title)
- `created_at`: Timestamp
- `updated_at`: Timestamp
- `metadata`: JSONB (for additional data)

### Messages Table
- `id`: UUID primary key
- `conversation_id`: UUID (foreign key to conversations)
- `role`: Text ('user', 'assistant', 'system')
- `content`: Text (message content)
- `created_at`: Timestamp
- `metadata`: JSONB (for additional data)

## Setup Steps

### 1. Install Dependencies

All required dependencies are already installed:
- `@neondatabase/serverless`
- `drizzle-orm`
- `drizzle-kit`
- `@clerk/clerk-react`
- `date-fns`
- `lucide-react`
- `tsx`

### 2. Generate Database Schema

```bash
npm run db:generate
```

This creates migration files in the `drizzle/` directory.

### 3. Run Database Migrations

```bash
npm run db:migrate
```

This applies the schema to your Neon database.

### 4. (Optional) Open Database Studio

```bash
npm run db:studio
```

This opens Drizzle Studio for visual database management.

## Usage

### Using the Conversation Components

```tsx
import { ConversationInterface } from './components/conversations';
import { ClerkProvider } from '@clerk/clerk-react';

function App() {
  return (
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <div className="h-screen">
        <ConversationInterface />
      </div>
    </ClerkProvider>
  );
}
```

### Using the Conversation Hook

```tsx
import { useConversations } from './hooks/useConversations';

function MyComponent() {
  const {
    conversations,
    currentConversation,
    loading,
    error,
    createConversation,
    selectConversation,
    addMessage,
    updateConversation,
    deleteConversation
  } = useConversations();

  // Your component logic here
}
```

### Using the Conversation Service Directly

```tsx
import { useConversationService } from './services/conversation.service';

function MyComponent() {
  const conversationService = useConversationService();
  
  const handleCreateConversation = async () => {
    const conversation = await conversationService.createConversation({
      title: 'New Conversation'
    });
  };
}
```

## File Structure

```
src/
├── lib/
│   ├── db.ts              # Database connection
│   └── schema.ts          # Database schema definitions
├── services/
│   └── conversation.service.ts  # Database operations
├── hooks/
│   └── useConversations.ts      # React hook for UI state
├── components/
│   └── conversations/
│       ├── ConversationList.tsx     # List of conversations
│       ├── MessageList.tsx          # List of messages
│       ├── MessageComposer.tsx      # Message input
│       ├── ConversationInterface.tsx # Main interface
│       └── index.ts                 # Exports
└── scripts/
    └── migrate.ts         # Migration script
```

## Security Notes

1. **Environment Variables**: Never commit `.env` files to version control
2. **User Isolation**: All database operations are scoped to the authenticated user via Clerk
3. **Input Validation**: The service layer includes basic validation
4. **Database Security**: Neon provides SSL by default

## Troubleshooting

### Common Issues

1. **Migration Fails**: Check your `DATABASE_URL` is correct
2. **Clerk Not Working**: Verify `VITE_CLERK_PUBLISHABLE_KEY` is set
3. **Database Connection**: Ensure your Neon database is active
4. **TypeScript Errors**: Run `npm run typecheck` to verify types

### Debugging

1. Check browser console for errors
2. Verify environment variables are loaded
3. Test database connection with `npm run db:studio`
4. Check Clerk user authentication status

## Next Steps

1. **AI Integration**: Add AI service calls in the message composer
2. **Real-time Updates**: Implement WebSocket for live message updates
3. **Message Search**: Add full-text search capabilities
4. **Export/Import**: Add conversation export/import features
5. **Message Reactions**: Add emoji reactions to messages
6. **File Attachments**: Support file uploads in conversations

## Support

For issues:
1. Check the [Neon Documentation](https://neon.tech/docs)
2. Check the [Clerk Documentation](https://clerk.com/docs)
3. Check the [Drizzle Documentation](https://orm.drizzle.team)