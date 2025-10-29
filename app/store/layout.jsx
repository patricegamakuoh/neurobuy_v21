import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "NeuroBuy - Store Dashboard",
    description: "NeuroBuy - Vendor Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
