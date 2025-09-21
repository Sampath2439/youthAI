import React, { useState } from 'react';
import { HeartPulseIcon, BrainCircuitIcon, MessageSquareIcon, BookOpenIcon, MusicNoteIcon, Bars3Icon, XMarkIcon } from './IconComponents';
import { auth } from '../services/firebaseService';
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

interface LandingPageProps {
  onLogin: () => void;
}

const navLinks = [
  { name: 'Home', href: '#' },
  { name: 'Features', href: '#features' },
  { name: 'About', href: '#about' },
  { name: 'Contact', href: '#contact' },
];

const features = [
  {
    name: 'Wellness Predictor',
    description: 'Answer a few questions and our AI will provide insights into your well-being, helping you understand key life factors.',
    icon: BrainCircuitIcon,
  },
  {
    name: 'AI Wellness Coach',
    description: 'Chat with an empathetic AI coach anytime you need to talk, get encouragement, or explore wellness strategies.',
    icon: MessageSquareIcon,
  },
  {
    name: 'Guided Meditation',
    description: 'Access guided breathing exercises and mindfulness sessions to reduce stress and find your calm.',
    icon: BookOpenIcon,
  },
  {
    name: 'AI Music Scapes',
    description: 'Based on your mood, our AI generates a personalized, soothing soundscape to help you relax or focus.',
    icon: MusicNoteIcon,
  },
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLogin }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      onLogin();
    } catch (error) {
      setError('Failed to sign in with Google. Please try again.');
      console.error("Google sign-in error:", error);
    }
  };

  const handleEmailSignUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      setError('Failed to sign up. Please check your email and password.');
      console.error("Email sign-up error:", error);
    }
  };

  const handleEmailSignIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onLogin();
    } catch (error) {
      setError('Failed to sign in. Please check your email and password.');
      console.error("Email sign-in error:", error);
    }
  };


  return (
    <div className="bg-slate-50 dark:bg-slate-900">
      <header className="lg:absolute fixed bottom-0 inset-x-0 top-0 z-50 h-fit">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center space-x-2">
              <span className="sr-only">Mindfulme</span>
              <HeartPulseIcon className="h-8 w-auto text-blue-600" />
              <span className="text-xl font-bold text-white">Mindfulme</span>
            </a>
          </div>
          <div className="flex lg:hidden">
            <button
              type="button"
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white"
              onClick={() => setMobileMenuOpen(true)}
            >
              <span className="sr-only">Open main menu</span>
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            {navLinks.map((item) => (
              <a key={item.name} href={item.href} className="text-sm font-semibold leading-6 text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                {item.name}
              </a>
            ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <button onClick={() => setLoginModalOpen(true)} className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 transition-colors">
              Log in
            </button>
          </div>
        </nav>
        {mobileMenuOpen && (
            <div className="lg:hidden" role="dialog" aria-modal="true">
                <div className="fixed inset-0 z-50" />
                <div className="fixed inset-x-0 bottom-0 z-50 w-full overflow-y-auto bg-white dark:bg-slate-900 px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-slate-900/10 dark:sm:ring-slate-800">
                    <div className="flex items-center justify-between">
                         <a href="#" className="-m-1.5 p-1.5 flex items-center space-x-2">
                            <span className="sr-only">Mindfulme</span>
                            <HeartPulseIcon className="h-8 w-auto text-blue-600" />
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-100">Mindfulme</span>
                        </a>
                        <button
                            type="button"
                            className="-m-2.5 rounded-md p-2.5 text-slate-700 dark:text-slate-300"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-slate-500/10 dark:divide-slate-200/20">
                            <div className="space-y-2 py-6">
                                {navLinks.map((item) => (
                                    <a
                                        key={item.name}
                                        href={item.href}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    >
                                        {item.name}
                                    </a>
                                ))}
                            </div>
                            <div className="py-6">
                                <button
                                    onClick={() => { setLoginModalOpen(true); setMobileMenuOpen(false); }}
                                    className="-mx-3 block w-full text-left rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-slate-900 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                                >
                                    Log in
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </header>

      <main>
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden pt-14">
            <img
                src="https://images.unsplash.com/photo-1502657877623-f66bf489d236?q=80&w=2069&auto=format&fit=crop"
                alt="Sunrise over mountains"
                className="absolute inset-0 -z-10 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-slate-900/40 to-slate-900/20"></div>
            
            <div className="absolute top-0 left-0 -z-10 w-72 h-72 bg-purple-200/50 rounded-full filter blur-3xl opacity-50 animate-float"></div>
            <div className="absolute bottom-0 right-0 -z-10 w-72 h-72 bg-sky-200/50 rounded-full filter blur-3xl opacity-50 animate-float" style={{animationDelay: '2s'}}></div>

          <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
            <div className="text-center">
              <p className="text-lg font-semibold leading-8 text-sky-300">
                A calmer mind begins with a single step.
              </p>
              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Your personalized mental health companion.
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-200">
                Track your emotions, gain AI-driven insights, and build mindful habits for a healthier you.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={() => setLoginModalOpen(true)}
                  className="rounded-md bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-transform hover:scale-105"
                >
                  Get Started
                </button>
                <a href="#features" className="text-sm font-semibold leading-6 text-white border border-white/80 rounded-md px-5 py-3 hover:bg-white/20 transition-colors">
                  Learn More <span aria-hidden="true">→</span>
                </a>
              </div>
              <div className="mt-12">
                  <p className="text-sm text-slate-300">Trusted by 10,000+ users worldwide</p>
                   <div className="mt-2 flex items-center justify-center -space-x-2">
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900" src="https://i.pravatar.cc/150?u=a" alt="User 1"/>
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900" src="https://i.pravatar.cc/150?u=b" alt="User 2"/>
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900" src="https://i.pravatar.cc/150?u=c" alt="User 3"/>
                      <img className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-slate-900" src="https://i.pravatar.cc/150?u=d" alt="User 4"/>
                   </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-white dark:bg-slate-800/50 py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
                <p className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Everything you need</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                A Holistic Approach to Wellness
                </h2>
                <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                Explore how our suite of AI-powered tools can support every aspect of your mental wellness journey.
                </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
                <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                {features.map((feature) => (
                    <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900 dark:text-white">
                        <feature.icon className="h-5 w-5 flex-none text-blue-600" aria-hidden="true" />
                        {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600 dark:text-slate-300">
                        <p className="flex-auto">{feature.description}</p>
                    </dd>
                    </div>
                ))}
                </dl>
            </div>
            </div>
        </div>
        
        {/* About Us Section */}
        <section id="about" className="py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 items-center gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
              <div className="lg:pr-4">
                <p className="text-base font-semibold leading-7 text-blue-600 dark:text-blue-400">Our Mission</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Accessible Wellness for All</h2>
                <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
                  We believe that everyone deserves access to mental wellness tools. Mindfulme was created to provide a safe, supportive, and personalized space for you to understand your emotions and build healthier habits.
                </p>
                <p className="mt-4 text-lg leading-8 text-slate-600 dark:text-slate-400">
                  By leveraging the power of AI, we aim to make mental health support more immediate, engaging, and stigma-free. Our goal is to be your trusted companion on your journey to a calmer, happier mind.
                </p>
              </div>
              <img
                src="https://images.unsplash.com/photo-1583623952385-237416954736?q=80&w=1887&auto=format&fit=crop"
                alt="A person meditating peacefully in nature"
                className="w-full rounded-2xl shadow-xl ring-1 ring-slate-400/10"
              />
            </div>
          </div>
        </section>

      </main>

      {loginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Login or Sign Up</h2>
              <button onClick={() => setLoginModalOpen(false)} className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-md dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100"
              />
              <div className="flex space-x-4">
                <button onClick={handleEmailSignIn} className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700">Sign In</button>
                <button onClick={handleEmailSignUp} className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700">Sign Up</button>
              </div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300 dark:border-slate-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400">Or</span>
                </div>
              </div>
              <button onClick={handleGoogleSignIn} className="w-full flex items-center justify-center space-x-2 bg-white border border-slate-300 text-slate-700 py-2 rounded-md hover:bg-slate-50 dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600 dark:hover:bg-slate-600">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.75 8.36,4.73 12.19,4.73C15.28,4.73 17.27,6.08 17.27,6.08L19.68,4.18C19.68,4.18 16.76,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.2 6.42,22 12.19,22C17.6,22 21.54,18.33 21.54,12.81C21.54,11.76 21.35,11.1 21.35,11.1Z"></path></svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <footer id="contact" className="bg-white dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-7xl overflow-hidden px-6 py-12 lg:px-8">
          <nav className="-mb-6 columns-2 sm:flex sm:justify-center sm:space-x-12" aria-label="Footer">
            {navLinks.map((item) => (
              <div key={item.name} className="pb-6">
                <a href={item.href} className="text-sm leading-6 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100">
                  {item.name}
                </a>
              </div>
            ))}
          </nav>
          <div className="mt-10 flex justify-center space-x-10">
            {/* Social media icons can be added here */}
          </div>
          <p className="mt-10 text-center text-xs leading-5 text-slate-500 dark:text-slate-400">
            &copy; {new Date().getFullYear()} Mindfulme. All rights reserved.
          </p>
           <p className="mt-4 text-center text-xs leading-5 text-slate-500 dark:text-slate-400 max-w-3xl mx-auto">
            Disclaimer: This is an AI-powered application for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </footer>
    </div>
  );
};