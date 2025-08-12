import Link from 'next/link';

const navItems = [
  { name: 'Home', href: '/' },
  { name: 'All Products', href: '/products' },
  { name: 'Categories', href: '/categories' },
  { name: 'Contact Us', href: '/contact' },
];

export function MainNav() {
  return (
    <nav className="border-b bg-background shadow-sm sticky top-20 z-30">
      <div className="container mx-auto flex justify-center items-center h-12 px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center space-x-6 lg:space-x-10">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className="text-lg font-headline text-foreground/70 transition-colors hover:text-primary"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
