import { MatchProvider } from '@/contexts/MatchContext';

export default function Layout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <MatchProvider>
            {children}
        </MatchProvider>
    );
}
