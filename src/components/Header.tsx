import Link from 'next/link';
import { Package2, Heart, List } from 'lucide-react';

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Package2 className="h-6 w-6" />
          <span className="font-headline text-xl">SmartAccessoryLink</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm lg:gap-6">
          <Link href="/" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80">
            <List className="h-4 w-4" />
            All Accessories
          </Link>
          <Link href="/favorites" className="flex items-center gap-1 transition-colors hover:text-accent-foreground/80">
            <Heart className="h-4 w-4" />
            Favorites
          </Link>
        </nav>
      </div>
    </header>
  );
}
