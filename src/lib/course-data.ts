// Static course data for MVP
export const courseData = {
  id: 'no-code-to-product',
  title: 'From No-Code to Product',
  description: 'Master the art of building profitable products without writing code. Join 200+ learners already on the waitlist.',
  price: 299,
  currency: 'USD',
  image_url: '/course-image.jpg',
  duration: {
    weeks: 5
  },
  pricing: {
    price: 299,
    features: [
      '5 weeks of intensive training',
      'Complete no-code toolkit access',
      'Weekly live mentorship sessions',
      'Private community access',
      'Launch strategy templates',
      '30-day money-back guarantee'
    ]
  },
  syllabus: [
    {
      week: 1,
      title: 'Kickoff & Tools',
      description: 'Set up your environment. Learn Lovable/bolt, Supabase, Apify, n8n, and AI APIs. Deploy your first site with login.',
      topics: [
        'Environment setup',
        'Lovable/bolt fundamentals',
        'Supabase configuration',
        'Apify & n8n basics',
        'AI API integration',
        'First deployment'
      ]
    },
    {
      week: 2,
      title: 'Frontend with Lovable/bolt',
      description: 'Design responsive pages, navigation, and forms. Build your homepage & search in hours, not weeks.',
      topics: [
        'Responsive design',
        'Navigation systems',
        'Form components',
        'Homepage creation',
        'Search functionality',
        'UI/UX best practices'
      ]
    },
    {
      week: 3,
      title: 'Live Data Integrations',
      description: 'Fetch real flight & hotel data with Apify and Supabase Edge Functions. Show results dynamically.',
      topics: [
        'Apify data scraping',
        'Edge Functions setup',
        'Real-time data fetching',
        'Dynamic result display',
        'Data transformation',
        'API optimization'
      ]
    },
    {
      week: 4,
      title: 'AI & Automation',
      description: 'Add AI trip planning via n8n workflows, custom emails, and fun features like "Parallel Universe" personas.',
      topics: [
        'n8n workflow automation',
        'AI trip planning',
        'Custom email systems',
        'Parallel Universe features',
        'AI persona creation',
        'Advanced automation'
      ]
    },
    {
      week: 5,
      title: 'Launch & Scale',
      description: 'Go live, connect your domain, optimize performance, and learn how to turn an MVP into a product.',
      topics: [
        'Production deployment',
        'Domain configuration',
        'Performance optimization',
        'MVP to product strategy',
        'Scaling techniques',
        'Launch checklist'
      ]
    }
  ],
  tools: [
    'Lovable',
    'Bolt',
    'Supabase',
    'n8n',
    'Stripe',
    'Resend',
    'Vapi'
  ],
  features: [
    {
      title: 'Build your MVP in 5 hours',
      description: 'Follow our proven framework to launch your product quickly',
      icon: '🚀'
    },
    {
      title: 'No coding experience required',
      description: 'Learn to use powerful no-code tools effectively',
      icon: '⚡'
    },
    {
      title: 'Get paying customers fast',
      description: 'Proven strategies to validate and monetize your idea',
      icon: '🏆'
    }
  ],
  stats: {
    students: 200,
    successRate: 100,
    revenue: 1
  },
  testimonials: [
    {
      name: 'Sarah Johnson',
      role: 'Founder, TechSolutions',
      content: 'This course helped me launch my SaaS product in just 6 weeks. The no-code approach saved me months of development time.',
      avatar: '/avatar1.jpg'
    },
    {
      name: 'Mike Chen',
      role: 'Product Manager',
      content: 'Amazing course! I built and validated 3 different product ideas using the techniques taught here.',
      avatar: '/avatar2.jpg'
    }
  ]
}