'use client'
import Banner from "@/components/Banner";
import ClerkNavbar from "@/components/ClerkNavbar";
import Footer from "@/components/Footer";

export default function PublicLayout({ children }) {

    return (
        <>
            <Banner />
            <ClerkNavbar />
            {children}
            <Footer />
        </>
    );
}
