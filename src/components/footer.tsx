import { Link } from 'react-router-dom';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-gray-600 hover:text-gray-900">About Us</Link></li>
              <li><Link to="/careers" className="text-gray-600 hover:text-gray-900">Careers</Link></li>
              <li><Link to="/press" className="text-gray-600 hover:text-gray-900">Press</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/help" className="text-gray-600 hover:text-gray-900">Help Center</Link></li>
              <li><Link to="/safety" className="text-gray-600 hover:text-gray-900">Safety Information</Link></li>
              <li><Link to="/cancellation" className="text-gray-600 hover:text-gray-900">Cancellation Options</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Hosting</h3>
            <ul className="space-y-2">
              <li><Link to="/host" className="text-gray-600 hover:text-gray-900">List Your Property</Link></li>
              <li><Link to="/host/resources" className="text-gray-600 hover:text-gray-900">Resources</Link></li>
              <li><Link to="/host/community" className="text-gray-600 hover:text-gray-900">Community</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-600 hover:text-gray-900">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-600 hover:text-gray-900">Terms of Service</Link></li>
              <li><Link to="/cookie-policy" className="text-gray-600 hover:text-gray-900">Cookie Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-8 text-center text-gray-600">
          <p>© {currentYear} Hotappa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}