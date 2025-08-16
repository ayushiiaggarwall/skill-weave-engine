# LearnLaunch MVP - No-Code Course Platform

A modern Learning Management System (LMS) built with React, Vite, TypeScript, and Tailwind CSS. This MVP demonstrates a complete online course platform inspired by successful no-code education platforms.

## 🚀 Features

### Core Features
- **Landing Page**: Beautiful, responsive landing page with hero section, course syllabus, and pricing
- **User Authentication**: Complete auth system with login/signup (Supabase ready)
- **Course Dashboard**: Student dashboard showing progress and course materials
- **Payment Integration**: Stripe-ready payment processing (demo mode)
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile

### Technical Features
- **React 18** with TypeScript for type safety
- **Vite** for lightning-fast development
- **Tailwind CSS** for modern, utility-first styling
- **Framer Motion** for smooth animations
- **React Router** for client-side routing
- **Supabase** integration for authentication and database
- **Stripe** integration for payments

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Custom animations
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Icons**: Lucide React
- **Animations**: Framer Motion

## 📁 Project Structure

```
src/
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── landing/            # Landing page sections
│   ├── auth/               # Authentication components
│   ├── dashboard/          # Dashboard components
│   └── payment/            # Payment components
├── lib/                    # Utilities and configurations
├── hooks/                  # Custom React hooks
└── App.tsx                 # Main app component
```

## 🎯 MVP Scope

This MVP focuses on the essential features needed for a course platform:

1. **Course Discovery**: Beautiful landing page showcasing the course
2. **User Onboarding**: Smooth signup/login flow
3. **Payment Flow**: Secure payment processing
4. **Course Access**: Simple dashboard for enrolled students

### What's Included
- Single course offering (expandable)
- Static course content and syllabus
- Mock payment processing (Stripe integration ready)
- Basic progress tracking
- Responsive design

### What's Not Included (Future Features)
- Admin panel for content management
- Multiple courses
- Video streaming
- Advanced progress tracking
- User roles and permissions
- Email notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 20.19.0 or higher
- npm or yarn

### Installation

1. **Clone and setup**:
   ```bash
   cd lms-mvp
   npm install
   ```

2. **Environment Setup**:
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your Supabase and Stripe credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
   VITE_APP_URL=http://localhost:5173
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

4. **Open**: Navigate to `http://localhost:5173`

## 🔧 Configuration

### Supabase Setup
1. Create a new Supabase project
2. Enable authentication
3. Create the following tables:
   ```sql
   -- Profiles table (extends auth.users)
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users PRIMARY KEY,
     email TEXT,
     full_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Courses table
   CREATE TABLE courses (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     price INTEGER NOT NULL,
     currency TEXT DEFAULT 'USD',
     created_at TIMESTAMP DEFAULT NOW()
   );

   -- Enrollments table
   CREATE TABLE enrollments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users,
     course_id TEXT REFERENCES courses(id),
     payment_status TEXT DEFAULT 'pending',
     stripe_session_id TEXT,
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

### Stripe Setup
1. Create a Stripe account
2. Get your publishable key from the dashboard
3. Set up webhooks for payment confirmation (production)

## 🌐 Deployment

### Netlify (Recommended)
1. Build the project: `npm run build`
2. Connect your repository to Netlify
3. Set environment variables in Netlify dashboard
4. Deploy

### Vercel
1. Connect your repository to Vercel
2. Set environment variables
3. Deploy

## 🎨 Design Features

- **Glassmorphism**: Modern glass-card effects
- **Gradient Text**: Eye-catching gradient headlines
- **Smooth Animations**: Framer Motion powered interactions
- **Dark/Light Mode**: Automatic theme detection
- **Mobile First**: Responsive design principles

## 📊 Course Data

The course content is stored in `src/lib/course-data.ts` and includes:
- Course title and description
- 5-week syllabus
- No-code tools covered
- Pricing information
- Student testimonials
- Success statistics

## 🔒 Security

- Environment variables for sensitive data
- Supabase RLS (Row Level Security) ready
- Secure payment processing with Stripe
- HTTPS enforcement in production

## 🚦 Demo Mode

The MVP includes demo mode functionality:
- Mock Supabase client when credentials aren't configured
- Simulated payment processing
- Sample data for development

## 📈 Performance

- **Vite**: Fast development and optimized builds
- **Code Splitting**: Automatic route-based splitting
- **Lazy Loading**: Components loaded on demand
- **Optimized Images**: Responsive image handling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔮 Future Enhancements

- Video streaming integration
- Advanced progress tracking
- Multi-course support
- Admin dashboard
- Email notifications
- Social features
- Mobile app

---

Built with ❤️ for entrepreneurs ready to launch their no-code journey!
