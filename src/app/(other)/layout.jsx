import NavigationSetter from "src/history";
import Providers from "../providers/providers";

export const metadata = {
    title: 'Techdoc',
    description: 'Manage Docs & Build API Documentation',
};

export default function RootLayout({ children }) {
    return (
        <>
            <Providers>
                {children}
            </Providers>
            <NavigationSetter />
        </>
    );
}