# Master Services - Business Website

A modern, responsive website for Master Services' business clients, built with React and Vite. This website showcases Master's property maintenance services for businesses across London.

## Features

- **Modern Design**: Clean, professional design inspired by industry leaders
- **Responsive Layout**: Fully responsive across all devices
- **Business-Focused**: Tailored content for business clients
- **Interactive Components**: Dynamic FAQ, testimonials, and contact forms
- **SEO Optimized**: Proper meta tags and semantic HTML
- **Fast Performance**: Built with Vite for optimal loading speeds

## Services Showcased

- **Cleaning Services**: End of tenancy, deep cleaning, regular maintenance
- **Trades Services**: Plumbing, electrical, handyman, carpentry
- **Business Solutions**: Multi-site management, API integration, reporting
- **Quality Assurance**: DBS checked professionals, £5M insurance coverage

## Technology Stack

- **React 18**: Modern React with hooks
- **Vite**: Fast build tool and dev server
- **React Router**: Client-side routing
- **Lucide React**: Beautiful icons
- **CSS3**: Modern styling with Flexbox and Grid
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd site_master
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and visit `http://localhost:3000`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.jsx      # Navigation header
│   ├── Hero.jsx        # Hero section
│   ├── Services.jsx    # Services showcase
│   ├── Features.jsx    # Features and benefits
│   ├── Process.jsx     # How it works
│   ├── Testimonials.jsx # Client testimonials
│   ├── FAQ.jsx         # Frequently asked questions
│   └── Footer.jsx      # Site footer
├── pages/              # Page components
│   ├── Contact.jsx     # Contact page
│   └── About.jsx       # About page
├── App.jsx             # Main app component
├── main.jsx            # App entry point
└── index.css           # Global styles
```

## Key Features

### Homepage Sections

1. **Hero Section**: Compelling value proposition with contact form
2. **Services**: Comprehensive service offerings with trust indicators
3. **Features**: Key benefits and why choose Master
4. **Process**: Simple 3-step process explanation
5. **Testimonials**: Client reviews and industry recognition
6. **FAQ**: Common questions and answers

### Additional Pages

- **Contact Page**: Detailed contact form and information
- **About Page**: Company story, values, and team

### Design Elements

- **Color Scheme**: Professional blue gradient with clean whites
- **Typography**: Inter font family for modern readability
- **Icons**: Lucide React icons for consistency
- **Animations**: Subtle hover effects and transitions
- **Cards**: Clean card-based layout for content sections

## Customization

### Colors
The main color scheme is defined in `src/index.css`:
- Primary: `#667eea` (blue gradient)
- Secondary: `#718096` (gray)
- Background: `#f7fafc` (light gray)

### Content
All content is easily customizable in the respective component files. Key areas:
- Company information in `Header.jsx` and `Footer.jsx`
- Service descriptions in `Services.jsx`
- FAQ content in `FAQ.jsx`
- Contact details in `Contact.jsx`

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized bundle size with Vite
- Lazy loading for images
- Efficient React components
- Minimal external dependencies

## Environment Variables

The following environment variables are required:

- `VITE_SUPABASE_URL`: Your Supabase project URL (e.g., `https://supabase.wearemaster.com`)
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key

### Setting Environment Variables in Production (Vercel)

1. Go to your Vercel project dashboard
2. Navigate to **Settings > Environment Variables**
3. Add the following variables:
   - `VITE_SUPABASE_URL` = `https://supabase.wearemaster.com` (or your actual Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anon key
4. **Important**: After adding/updating variables, redeploy your application

### Troubleshooting

#### Error: `net::ERR_NAME_NOT_RESOLVED` when fetching services

This error occurs when the Supabase URL is incorrect or the domain cannot be resolved.

**For Self-Hosted Supabase:**

1. **Verify the correct Supabase URL:**
   - SSH into your Supabase server: `ssh root@168.231.112.159`
   - Check the Supabase configuration to find the public URL
   - Common URLs for self-hosted Supabase:
     - `https://supabase.wearemaster.com`
     - `https://api.wearemaster.com`
     - Or check your reverse proxy/nginx configuration

2. **Verify DNS Configuration:**
   ```bash
   # Test DNS resolution
   nslookup supabase.wearemaster.com
   # or
   dig supabase.wearemaster.com
   ```
   - If DNS doesn't resolve, add an A record pointing to your server IP (168.231.112.159)

3. **Check Supabase is accessible:**
   ```bash
   # From your server
   curl https://supabase.wearemaster.com/rest/v1/
   # Should return a response (even if 401/403, that means it's reachable)
   ```

4. **Update Vercel Environment Variables:**
   - Go to Vercel Dashboard > Settings > Environment Variables
   - Set `VITE_SUPABASE_URL` to the correct URL (e.g., `https://supabase.wearemaster.com`)
   - **Important**: Redeploy after updating environment variables

**Common Issues:**
- ❌ Using `storage.wearemaster.com` (doesn't exist) → Use `supabase.wearemaster.com`
- ❌ Missing `https://` protocol → Always use `https://`
- ❌ DNS not configured → Add A record for the subdomain
- ❌ Firewall blocking → Ensure port 443 is open

**To check your current configuration:**
- Open browser console in production
- Look for error messages starting with `❌` - they will show the current URL configuration
- The console will show the hostname being used for debugging

## License

This project is proprietary to Master Services Trades Ltd.

## Contact

For questions about this website or Master Services:

- **Email**: hello@wearemaster.com
- **Phone**: 020 3337 6168
- **Address**: 124 City Rd, London EC1V 2NX, United Kingdom

---

Built with ❤️ for Master Services Business Clients
