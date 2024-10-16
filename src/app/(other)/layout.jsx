import NavigationSetter from "src/history";
import Providers from "../providers/providers";

export const metadata = {
    title: 'Techdoc',
    description: 'Manage Docs & Build API Documentation',
};

export default function RootLayout({ children }) {
    return (
        <>
            <head>
                <link rel="icon" href="/favicon.ico" />
            </head>
            <Providers>
                {children}
            </Providers>
            <NavigationSetter />
        </>
    );
}