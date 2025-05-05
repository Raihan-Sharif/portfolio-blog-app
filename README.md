# Raihan Sharif - Portfolio & Blog Website

A modern, full-stack portfolio and blog application built with Next.js, Supabase, and Tailwind CSS.

![Portfolio Screenshot](public/images/portfolio-screenshot.png)

## Features

- **Responsive Design**: Optimized for all devices from mobile to desktop
- **Dynamic Theming**: Customizable color schemes that can be changed from the admin panel
- **Authentication**: Secure role-based authentication (Admin, Editor, Viewer)
- **Portfolio Showcase**: Display your projects, skills, and professional experience
- **Blog Platform**: Powerful blog with rich text editor, categories, and tags
- **Admin Dashboard**: Comprehensive dashboard with content management and analytics
- **SEO Optimized**: Built-in SEO best practices for better discovery
- **Dark Mode Support**: Toggle between light and dark themes

## Tech Stack

- **Frontend**:

  - Next.js 14 (App Router)
  - React 18
  - Tailwind CSS
  - shadcn/ui components
  - Framer Motion for animations
  - TipTap for rich text editing

- **Backend**:

  - Supabase (PostgreSQL)
  - Supabase Auth
  - Supabase Storage
  - Server Components and Server Actions

- **Deployment**:
  - Vercel

## Getting Started

### Prerequisites

- Node.js 18.17.0 or newer
- npm or yarn
- A Supabase account
- Git

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/raihan-portfolio-blog.git
   cd raihan-portfolio-blog
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up your environment variables:
   Create a `.env.local` file with the following variables:

   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret
   ```

4. Set up the database:

   - Use the SQL script in `database/schema.sql` to create all the necessary tables in Supabase
   - Follow the instructions in the deployment guide to set up RLS policies

5. Run the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

## Project Structure

```
/
├── app/                      # Next.js App Router
│   ├── (auth)/               # Authentication pages
│   ├── (portfolio)/          # Portfolio pages
│   ├── (blog)/               # Blog pages
│   ├── (admin)/              # Admin pages
│   ├── api/                  # API routes
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Home page
├── components/               # React components
│   ├── ui/                   # UI components
│   ├── layout/               # Layout components
│   ├── forms/                # Form components
│   ├── portfolio/            # Portfolio components
│   ├── blog/                 # Blog components
│   └── admin/                # Admin components
├── lib/                      # Utility functions
│   ├── supabase/             # Supabase client
│   ├── hooks/                # Custom hooks
│   ├── utils/                # Utility functions
│   └── constants/            # Constants
├── public/                   # Static files
├── styles/                   # Global styles
├── database/                 # Database schema and migrations
└── middleware.ts             # Next.js middleware
```

## Key Features Explained

### Authentication & Authorization

The application uses Supabase Auth for authentication and implements a role-based permission system:

- **Admin**: Full access to everything, including user management
- **Editor**: Can create and manage blog posts and content
- **Viewer**: Default role for registered users

### Portfolio Features

- Project showcase with images, descriptions, links
- Skills section with proficiency indicators
- About page with bio and professional experience
- Contact form for inquiries

### Blog Features

- Rich text editor with image and video embedding
- Categories and tags for content organization
- Comments system (optional)
- Featured posts section
- Reading time estimation

### Admin Dashboard

- Analytics overview with post views and user stats
- Content management for blog posts and projects
- User management for admins
- Theme customization settings
- SEO management

## Customization

### Changing Theme

The application supports dynamic theming. You can customize the theme colors from the admin panel or by editing the `tailwind.config.js` file.

### Adding Your Content

1. Log in as an admin
2. Use the admin dashboard to add:
   - Projects to your portfolio
   - Skills and categories
   - Blog posts
   - Social media links

### Extending the Application

The project is built with extensibility in mind. You can:

- Add new pages in the `app` directory
- Create new components in the `components` directory
- Add new database tables by extending the schema
- Implement additional features with Supabase or external APIs

## Deployment

For detailed deployment instructions, see the [Deployment Guide](DEPLOYMENT.md).

Quick steps for Vercel deployment:

1. Push your code to GitHub
2. Import the repository to Vercel
3. Configure environment variables in Vercel
4. Deploy

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Next.js](https://nextjs.org/)
- [Supabase](https://supabase.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Framer Motion](https://www.framer.com/motion/)
- [TipTap](https://tiptap.dev/)

---

Built with ♥ by [Md Raihan Sharif](https://github.com/Raihan-Sharif)
