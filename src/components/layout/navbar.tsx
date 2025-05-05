'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ModeToggle } from '@/components/ui/mode-toggle';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { supabase } from '@/lib/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [user, setUser] = useState(null);
    const pathname = usePathname();
    const { theme } = useTheme();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getSession();
            setUser(data.session?.user || null);
        };

        getUser();

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (event, session) => {
                setUser(session?.user || null);
            }
        );

        return () => {
            authListener.subscription.unsubscribe();
        };
    }, []);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/about', label: 'About' },
        { href: '/projects', label: 'Projects' },
        { href: '/skills', label: 'Skills' },
        { href: '/blog', label: 'Blog' },
        { href: '/contact', label: 'Contact' },
    ];

    const navbarClasses = cn(
        'fixed w-full z-50 transition-all duration-300',
        {
            'bg-background/80 backdrop-blur-md shadow-md': isScrolled,
            'bg-transparent': !isScrolled,
        }
    );

    return (



        {/* Logo */ }
          
            
              Raihan Sharif



    {/* Desktop Navigation */ }


    {
        navLinks.map((link) => (
            <Link
                key={link.href}
                href={link.href}
                className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    pathname === link.href
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                )}
            >
                {link.label}
                
              ))}
                {user ? (


                    Dashboard

                ) : (
                    Sign In  
                
              )}


                {/* Mobile menu button */}

                {isOpen ?  : }


                {/* Mobile menu */}

                {isOpen && (


                    {
                        navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={closeMenu}
                                className={cn(
                                    'block px-3 py-2 rounded-md text-base font-medium',
                                    pathname === link.href
                                        ? 'bg-primary text-primary-foreground'
                                        : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                                )}
                            >
                                {link.label}
                
              ))}
                                {user ? (

                                    Dashboard

                                ) : (

                                    Sign In
                
              )}
            
          
        )}


                                );
}