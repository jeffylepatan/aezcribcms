import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="text-white py-16" style={{ backgroundColor: '#5C6B73' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand & About */}
          <div className="md:col-span-2">
            <h3 className="text-3xl font-bold mb-4">🌟 AezCrib</h3>
            <p className="text-lg mb-6 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              We believe every child deserves engaging, high-quality educational content. 
              AezCrib transforms learning into an adventure, making education accessible, 
              fun, and effective for families worldwide.
            </p>
            <div className="flex space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span className="text-xl">📚</span>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span className="text-xl">🎯</span>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
                <span className="text-xl">❤️</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/worksheets" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Browse Worksheets</Link></li>
              <li><Link href="/videos" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Watch Videos</Link></li>
              <li><Link href="/support" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Help Center</Link></li>
              <li><Link href="/contact" className="hover:opacity-80 transition-opacity" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>Contact Us</Link></li>
            </ul>
          </div>

          {/* Newsletter Signup */}
          <div>
            <h4 className="text-xl font-bold mb-4">Stay Updated! 📬</h4>
            <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.9)' }}>
              Get weekly learning tips and new content alerts!
            </p>
            <div className="space-y-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2"
                style={{ backgroundColor: '#FFFFFF', boxShadow: '0 0 0 2px rgba(75, 192, 200, 0.3)' }}
              />
              <button className="w-full px-4 py-3 rounded-lg font-semibold transition-all hover:scale-105 shadow-md" style={{ backgroundColor: '#FFD166', color: '#2D3748' }}>
                Subscribe Free
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t pt-8 flex flex-col md:flex-row justify-between items-center" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
          <div className="flex space-x-6 mb-4 md:mb-0">
            <Link href="/privacy" className="text-sm hover:opacity-80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Privacy Policy</Link>
            <Link href="/terms" className="text-sm hover:opacity-80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Terms of Service</Link>
            <Link href="/cookies" className="text-sm hover:opacity-80" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Cookie Policy</Link>
          </div>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>
            © 2025 AezCrib. Made with ❤️ for families everywhere.
          </p>
        </div>
      </div>
    </footer>
  );
}