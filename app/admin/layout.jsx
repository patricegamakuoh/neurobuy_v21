import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "NeuroBuy - Admin Dashboard",
    description: "NeuroBuy - Admin Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
