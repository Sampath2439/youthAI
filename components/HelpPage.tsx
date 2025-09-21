import React from 'react';
import { CircleHelpIcon, PhoneIcon, ExternalLinkIcon, ExclamationTriangleIcon } from './IconComponents';

interface ResourceCardProps {
    icon: React.FC<{className?: string}>;
    title: string;
    description: string;
    contact?: string;
    link?: string;
    isHotline?: boolean;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ icon: Icon, title, description, contact, link, isHotline }) => {
    return (
        <div className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl p-6 rounded-2xl shadow-md border border-white/30">
            <div className="flex items-start gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${isHotline ? 'bg-red-100 dark:bg-red-900/40' : 'bg-blue-100 dark:bg-blue-900/40'}`}>
                    <Icon className={`w-6 h-6 ${isHotline ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'}`} />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800 dark:text-slate-100 text-lg">{title}</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{description}</p>
                    {contact && (
                        <a href={`tel:${contact}`} className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                            <PhoneIcon className="w-4 h-4" />
                            {contact}
                        </a>
                    )}
                    {link && (
                         <a href={link} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                            <ExternalLinkIcon className="w-4 h-4" />
                            Visit Website
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};


export const HelpPage: React.FC = () => {
    return (
        <main className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-8">
                    <CircleHelpIcon className="h-12 w-12 text-blue-600 mx-auto mb-2" />
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Urgent Support & Helplines</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        If you're in crisis or need someone to talk to, please reach out. Help is available.
                    </p>
                </div>

                <div className="bg-red-50 dark:bg-red-900/30 p-4 rounded-xl mb-8 border border-red-200 dark:border-red-500/40 flex items-center gap-3">
                    <ExclamationTriangleIcon className="w-8 h-8 text-red-600 dark:text-red-300 flex-shrink-0" />
                    <div>
                        <h4 className="font-bold text-red-800 dark:text-red-200">Emergency Disclaimer</h4>
                        <p className="text-sm text-red-700 dark:text-red-300">
                           If you are in immediate danger, please call 911 or your local emergency number. This app is not a substitute for professional medical help.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    <ResourceCard
                        icon={PhoneIcon}
                        title="National Suicide Prevention Lifeline"
                        description="Provides 24/7, free and confidential support for people in distress, prevention and crisis resources."
                        contact="988"
                        isHotline={true}
                    />
                    <ResourceCard
                        icon={PhoneIcon}
                        title="Crisis Text Line"
                        description="Text with a trained Crisis Counselor from anywhere in the US, anytime, about any type of crisis."
                        contact="Text HOME to 741741"
                        isHotline={true}
                    />
                    <ResourceCard
                        icon={ExternalLinkIcon}
                        title="The Trevor Project"
                        description="The leading national organization providing crisis intervention and suicide prevention services to LGBTQ young people."
                        link="https://www.thetrevorproject.org/"
                    />
                    <ResourceCard
                        icon={ExternalLinkIcon}
                        title="NAMI (National Alliance on Mental Illness)"
                        description="The nation’s largest grassroots mental health organization dedicated to building better lives for Americans affected by mental illness."
                        link="https://www.nami.org/"
                    />
                    <ResourceCard
                        icon={ExternalLinkIcon}
                        title="Psychology Today Therapist Finder"
                        description="A comprehensive directory of therapists, psychologists, and counselors in your area."
                        link="https://www.psychologytoday.com/us/therapists"
                    />
                </div>
            </div>
        </main>
    );
};